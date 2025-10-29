"""
Security Manager Service for AI Agent Studio Cloud Backend
Handles security policies, rate limiting, input validation, and threat detection
"""

import asyncio
import time
import re
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass
from collections import defaultdict, deque
from enum import Enum
import hashlib
import ipaddress

logger = logging.getLogger(__name__)

class ThreatLevel(Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    CRITICAL = "critical"

class SecurityAction(Enum):
    ALLOW = "allow"
    RATE_LIMIT = "rate_limit"
    BLOCK_TEMPORARY = "block_temporary"
    BLOCK_PERMANENT = "block_permanent"
    REQUIRE_CAPTCHA = "require_captcha"

@dataclass
class SecurityEvent:
    event_id: str
    event_type: str
    threat_level: ThreatLevel
    ip_address: str
    user_id: Optional[str]
    user_agent: Optional[str]
    description: str
    timestamp: datetime
    metadata: Dict[str, Any]

@dataclass
class RateLimitRule:
    name: str
    requests_per_window: int
    window_seconds: int
    burst_limit: Optional[int] = None
    block_duration_seconds: int = 300  # 5 minutes default

class RateLimiter:
    def __init__(self):
        # Track requests per IP/user
        self.ip_requests: Dict[str, deque] = defaultdict(deque)
        self.user_requests: Dict[str, deque] = defaultdict(deque)
        self.blocked_ips: Dict[str, float] = {}  # IP -> unblock_time
        self.blocked_users: Dict[str, float] = {}  # user_id -> unblock_time
        
        # Default rate limiting rules
        self.rules = {
            "api_general": RateLimitRule("api_general", 100, 3600, 10, 300),  # 100/hour, burst 10
            "auth": RateLimitRule("auth", 5, 300, 2, 900),  # 5 login attempts per 5 min
            "generation": RateLimitRule("generation", 10, 60, 3, 120),  # 10 generations per minute
            "upload": RateLimitRule("upload", 20, 3600, 5, 600),  # 20 uploads per hour
        }
    
    def is_blocked(self, ip: str, user_id: str = None) -> bool:
        """Check if IP or user is currently blocked"""
        now = time.time()
        
        # Check IP block
        if ip in self.blocked_ips:
            if now < self.blocked_ips[ip]:
                return True
            else:
                del self.blocked_ips[ip]
        
        # Check user block
        if user_id and user_id in self.blocked_users:
            if now < self.blocked_users[user_id]:
                return True
            else:
                del self.blocked_users[user_id]
        
        return False
    
    def check_rate_limit(self, rule_name: str, ip: str, user_id: str = None) -> SecurityAction:
        """Check if request should be rate limited"""
        if rule_name not in self.rules:
            return SecurityAction.ALLOW
        
        if self.is_blocked(ip, user_id):
            return SecurityAction.BLOCK_TEMPORARY
        
        rule = self.rules[rule_name]
        now = time.time()
        window_start = now - rule.window_seconds
        
        # Clean old requests and count current requests
        ip_count = self._count_requests(self.ip_requests[ip], window_start, now)
        user_count = self._count_requests(self.user_requests[user_id or ""], window_start, now) if user_id else 0
        
        # Check against limits
        max_count = max(ip_count, user_count)
        
        # Check burst limit first
        if rule.burst_limit and max_count >= rule.burst_limit:
            recent_window = now - 60  # Last minute
            recent_ip_count = self._count_requests(self.ip_requests[ip], recent_window, now)
            recent_user_count = self._count_requests(self.user_requests[user_id or ""], recent_window, now) if user_id else 0
            
            if max(recent_ip_count, recent_user_count) >= rule.burst_limit:
                self._block_temporarily(ip, user_id, rule.block_duration_seconds)
                return SecurityAction.BLOCK_TEMPORARY
        
        # Check main rate limit
        if max_count >= rule.requests_per_window:
            return SecurityAction.RATE_LIMIT
        
        # Record this request
        self.ip_requests[ip].append(now)
        if user_id:
            self.user_requests[user_id].append(now)
        
        return SecurityAction.ALLOW
    
    def _count_requests(self, request_queue: deque, window_start: float, now: float) -> int:
        """Count requests in the current window and clean old ones"""
        # Remove old requests
        while request_queue and request_queue[0] < window_start:
            request_queue.popleft()
        
        return len(request_queue)
    
    def _block_temporarily(self, ip: str, user_id: str = None, duration: int = 300):
        """Block IP/user temporarily"""
        unblock_time = time.time() + duration
        self.blocked_ips[ip] = unblock_time
        
        if user_id:
            self.blocked_users[user_id] = unblock_time
        
        logger.warning(f"Temporarily blocked IP {ip}" + (f" and user {user_id}" if user_id else ""))

class InputValidator:
    def __init__(self):
        # Dangerous patterns to detect
        self.sql_injection_patterns = [
            r"(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)",
            r"[\'\";].*(\bOR\b|\bAND\b).*[\'\";]",
            r"[\'\"];.*--"
        ]
        
        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>"
        ]
        
        self.command_injection_patterns = [
            r"[;&|`$]",
            r"\b(rm|ls|cat|wget|curl|nc|telnet|ssh)\b",
            r"\.\.\/",
            r"\$\([^)]*\)",
            r"`[^`]*`"
        ]
        
        # Content filtering
        self.profanity_words = set([
            # Add profanity words here - keeping this minimal for example
            "badword1", "badword2"
        ])
        
        self.suspicious_keywords = set([
            "hack", "exploit", "vulnerability", "backdoor", "malware",
            "virus", "trojan", "phishing", "spam", "ddos"
        ])
    
    def validate_text_input(self, text: str, max_length: int = 10000) -> Dict[str, Any]:
        """Validate text input for security threats"""
        if not text:
            return {"valid": True, "threats": []}
        
        if len(text) > max_length:
            return {"valid": False, "threats": ["Text exceeds maximum length"]}
        
        threats = []
        
        # Check for SQL injection
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append("Potential SQL injection detected")
                break
        
        # Check for XSS
        for pattern in self.xss_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append("Potential XSS attack detected")
                break
        
        # Check for command injection
        for pattern in self.command_injection_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats.append("Potential command injection detected")
                break
        
        # Check for profanity
        words = re.findall(r'\b\w+\b', text.lower())
        if any(word in self.profanity_words for word in words):
            threats.append("Inappropriate content detected")
        
        # Check for suspicious keywords
        if any(keyword in text.lower() for keyword in self.suspicious_keywords):
            threats.append("Suspicious keywords detected")
        
        return {
            "valid": len(threats) == 0,
            "threats": threats,
            "threat_level": ThreatLevel.HIGH.value if threats else ThreatLevel.LOW.value
        }
    
    def validate_file_upload(self, filename: str, content_type: str, file_size: int) -> Dict[str, Any]:
        """Validate file upload for security"""
        threats = []
        
        # Check file extension
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3', '.wav', '.txt', '.py', '.js'}
        file_ext = filename.lower().split('.')[-1] if '.' in filename else ""
        
        if f".{file_ext}" not in allowed_extensions:
            threats.append(f"File extension .{file_ext} not allowed")
        
        # Check for double extensions (e.g., .jpg.exe)
        if filename.count('.') > 1:
            threats.append("Multiple file extensions detected")
        
        # Check filename for suspicious patterns
        if re.search(r'[<>:"/\\|?*]', filename):
            threats.append("Filename contains invalid characters")
        
        # Check file size (100MB limit)
        if file_size > 100 * 1024 * 1024:
            threats.append("File size exceeds maximum limit")
        
        # Check content type mismatch
        expected_types = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'mp4': 'video/mp4', 'mp3': 'audio/mpeg',
            'wav': 'audio/wav', 'txt': 'text/plain'
        }
        
        expected_type = expected_types.get(file_ext)
        if expected_type and content_type != expected_type:
            threats.append("Content type doesn't match file extension")
        
        return {
            "valid": len(threats) == 0,
            "threats": threats,
            "threat_level": ThreatLevel.HIGH.value if threats else ThreatLevel.LOW.value
        }

class SecurityManager:
    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.input_validator = InputValidator()
        self.security_events: List[SecurityEvent] = []
        self.blocked_ips: Set[str] = set()
        self.trusted_ips: Set[str] = set()
        
        # Security configuration
        self.max_failed_attempts = 5
        self.lockout_duration = 900  # 15 minutes
        self.failed_attempts: Dict[str, List[datetime]] = defaultdict(list)
        
        # Threat detection patterns
        self.suspicious_user_agents = [
            "bot", "crawler", "spider", "scraper", "scanner"
        ]
    
    async def check_request_security(
        self, 
        endpoint: str,
        ip: str, 
        user_id: str = None,
        user_agent: str = None,
        request_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Comprehensive security check for incoming request"""
        
        # Determine rate limit rule based on endpoint
        rule_name = self._get_rate_limit_rule(endpoint)
        
        # Check rate limiting
        rate_limit_action = self.rate_limiter.check_rate_limit(rule_name, ip, user_id)
        
        if rate_limit_action != SecurityAction.ALLOW:
            await self._log_security_event(
                "rate_limit_exceeded",
                ThreatLevel.MEDIUM,
                ip, user_id, user_agent,
                f"Rate limit exceeded for {endpoint}",
                {"endpoint": endpoint, "rule": rule_name}
            )
            return {
                "allowed": False,
                "action": rate_limit_action.value,
                "reason": "Rate limit exceeded"
            }
        
        # Check IP reputation
        if await self._is_suspicious_ip(ip):
            await self._log_security_event(
                "suspicious_ip",
                ThreatLevel.HIGH,
                ip, user_id, user_agent,
                "Request from suspicious IP address",
                {"endpoint": endpoint}
            )
            return {
                "allowed": False,
                "action": SecurityAction.BLOCK_TEMPORARY.value,
                "reason": "Suspicious IP address"
            }
        
        # Check user agent
        if user_agent and await self._is_suspicious_user_agent(user_agent):
            await self._log_security_event(
                "suspicious_user_agent",
                ThreatLevel.MEDIUM,
                ip, user_id, user_agent,
                "Suspicious user agent detected",
                {"endpoint": endpoint}
            )
        
        # Validate request data if provided
        if request_data:
            validation_result = await self._validate_request_data(request_data)
            if not validation_result["valid"]:
                await self._log_security_event(
                    "malicious_input",
                    ThreatLevel.HIGH,
                    ip, user_id, user_agent,
                    f"Malicious input detected: {validation_result['threats']}",
                    {"endpoint": endpoint, "threats": validation_result["threats"]}
                )
                return {
                    "allowed": False,
                    "action": SecurityAction.BLOCK_TEMPORARY.value,
                    "reason": "Malicious input detected"
                }
        
        return {
            "allowed": True,
            "action": SecurityAction.ALLOW.value,
            "reason": "Request passed security checks"
        }
    
    async def record_failed_login(self, identifier: str, ip: str):
        """Record failed login attempt"""
        now = datetime.utcnow()
        
        # Clean old attempts (older than 1 hour)
        cutoff = now - timedelta(hours=1)
        self.failed_attempts[identifier] = [
            attempt for attempt in self.failed_attempts[identifier]
            if attempt > cutoff
        ]
        
        # Record this attempt
        self.failed_attempts[identifier].append(now)
        
        # Check if should be locked out
        if len(self.failed_attempts[identifier]) >= self.max_failed_attempts:
            await self._log_security_event(
                "brute_force_attempt",
                ThreatLevel.HIGH,
                ip, None, None,
                f"Multiple failed login attempts for {identifier}",
                {"attempts": len(self.failed_attempts[identifier])}
            )
            
            # Block IP temporarily
            self.blocked_ips.add(ip)
            
            return True  # Account should be locked
        
        return False
    
    async def validate_prompt(self, prompt: str) -> Dict[str, Any]:
        """Validate AI generation prompt for security and appropriateness"""
        validation = self.input_validator.validate_text_input(prompt, max_length=5000)
        
        # Additional prompt-specific checks
        threats = validation.get("threats", [])
        
        # Check for attempts to jailbreak or manipulate AI
        jailbreak_patterns = [
            r"ignore previous instructions",
            r"pretend you are",
            r"roleplay as",
            r"forget everything",
            r"new instructions:",
            r"system prompt:",
            r"developer mode"
        ]
        
        for pattern in jailbreak_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                threats.append("Potential AI manipulation attempt detected")
                break
        
        # Check for requests for harmful content
        harmful_patterns = [
            r"how to make.*(?:bomb|explosive|weapon)",
            r"illegal.*(?:drugs|activities|hacking)",
            r"personal information.*(?:steal|extract|obtain)",
            r"bypass.*(?:security|authentication|protection)"
        ]
        
        for pattern in harmful_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                threats.append("Request for harmful content detected")
                break
        
        return {
            "valid": len(threats) == 0,
            "threats": threats,
            "filtered_prompt": self._filter_prompt(prompt) if threats else prompt,
            "threat_level": ThreatLevel.HIGH.value if any("harmful" in t or "manipulation" in t for t in threats) else validation.get("threat_level", ThreatLevel.LOW.value)
        }
    
    def _filter_prompt(self, prompt: str) -> str:
        """Filter and sanitize prompt"""
        # Remove potential harmful instructions
        filtered = re.sub(r"ignore previous instructions.*", "", prompt, flags=re.IGNORECASE)
        filtered = re.sub(r"pretend you are.*", "", filtered, flags=re.IGNORECASE)
        filtered = re.sub(r"roleplay as.*", "", filtered, flags=re.IGNORECASE)
        
        return filtered.strip()
    
    async def _validate_request_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate request data for security threats"""
        all_threats = []
        
        for key, value in data.items():
            if isinstance(value, str):
                validation = self.input_validator.validate_text_input(value)
                if not validation["valid"]:
                    all_threats.extend([f"{key}: {threat}" for threat in validation["threats"]])
        
        return {
            "valid": len(all_threats) == 0,
            "threats": all_threats
        }
    
    def _get_rate_limit_rule(self, endpoint: str) -> str:
        """Determine appropriate rate limiting rule for endpoint"""
        if "auth" in endpoint or "login" in endpoint:
            return "auth"
        elif "generate" in endpoint or "create" in endpoint:
            return "generation"  
        elif "upload" in endpoint:
            return "upload"
        else:
            return "api_general"
    
    async def _is_suspicious_ip(self, ip: str) -> bool:
        """Check if IP address is suspicious"""
        # Check if IP is in blocked list
        if ip in self.blocked_ips:
            return True
        
        # Check if IP is in trusted list
        if ip in self.trusted_ips:
            return False
        
        # Check for private/local IPs (these are generally trusted)
        try:
            ip_obj = ipaddress.ip_address(ip)
            if ip_obj.is_private or ip_obj.is_loopback:
                return False
        except ValueError:
            return True  # Invalid IP format is suspicious
        
        # Additional IP reputation checks could be added here
        # (e.g., checking against threat intelligence feeds)
        
        return False
    
    async def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        if not user_agent:
            return True
        
        user_agent_lower = user_agent.lower()
        
        # Check for known suspicious patterns
        for pattern in self.suspicious_user_agents:
            if pattern in user_agent_lower:
                return True
        
        # Check for empty or very short user agents
        if len(user_agent.strip()) < 10:
            return True
        
        return False
    
    async def _log_security_event(
        self, 
        event_type: str, 
        threat_level: ThreatLevel, 
        ip: str,
        user_id: str = None, 
        user_agent: str = None, 
        description: str = "", 
        metadata: Dict[str, Any] = None
    ):
        """Log security event"""
        import uuid
        
        event = SecurityEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            threat_level=threat_level,
            ip_address=ip,
            user_id=user_id,
            user_agent=user_agent,
            description=description,
            timestamp=datetime.utcnow(),
            metadata=metadata or {}
        )
        
        self.security_events.append(event)
        
        # Keep only recent events (last 1000)
        if len(self.security_events) > 1000:
            self.security_events = self.security_events[-1000:]
        
        # Log to system logger
        log_level = logging.WARNING if threat_level in [ThreatLevel.HIGH, ThreatLevel.CRITICAL] else logging.INFO
        logger.log(log_level, f"Security event: {event_type} from {ip} - {description}")
    
    async def get_security_stats(self) -> Dict[str, Any]:
        """Get security statistics"""
        now = datetime.utcnow()
        last_hour = now - timedelta(hours=1)
        last_day = now - timedelta(days=1)
        
        recent_events = [e for e in self.security_events if e.timestamp > last_hour]
        daily_events = [e for e in self.security_events if e.timestamp > last_day]
        
        return {
            "total_events": len(self.security_events),
            "events_last_hour": len(recent_events),
            "events_last_day": len(daily_events),
            "blocked_ips_count": len(self.blocked_ips),
            "trusted_ips_count": len(self.trusted_ips),
            "threat_levels": {
                level.value: len([e for e in daily_events if e.threat_level == level])
                for level in ThreatLevel
            }
        }

# Global security manager instance
security_manager = SecurityManager()