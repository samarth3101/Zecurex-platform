import collections
import math
from typing import Dict, List, Any

class TimeWindowAggregator:
    def __init__(self, max_window_seconds: int = 30 * 24 * 3600):
        # We store events for each entity (customer, merchant, ip, device)
        # Dictionary of entity_id -> deque of events
        self.history = collections.defaultdict(collections.deque)
        self.max_window = max_window_seconds
        
    def add_event(self, entity_id: str, timestamp: float, event: Dict[str, Any]):
        """Add an event to the entity's history, removing events older than max_window."""
        q = self.history[entity_id]
        q.append((timestamp, event))
        
        # Prune old events
        while q and (timestamp - q[0][0]) > self.max_window:
            q.popleft()
            
    def get_events(self, entity_id: str, current_timestamp: float, window_seconds: int) -> List[Dict[str, Any]]:
        """Retrieve events within the window strictly before the current timestamp."""
        q = self.history.get(entity_id)
        if not q:
            return []
            
        valid_events = []
        for ts, ev in reversed(q):
            # Only consider events strictly before current timestamp
            if ts >= current_timestamp:
                continue
                
            if (current_timestamp - ts) <= window_seconds:
                valid_events.append(ev)
            else:
                break
                
        # Return in chronological order
        return valid_events[::-1]

def safe_mean(values: List[float], default: float = -1.0) -> float:
    if not values:
        return default
    return sum(values) / len(values)

def safe_std(values: List[float], default: float = -1.0) -> float:
    if len(values) < 2:
        return default
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)

def safe_rate(successes: int, total: int, default: float = -1.0) -> float:
    if total == 0:
        return default
    return successes / total

def safe_max(values: List[float], default: float = -1.0) -> float:
    if not values:
        return default
    return max(values)
