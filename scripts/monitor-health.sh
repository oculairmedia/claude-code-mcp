#!/bin/bash

# Claude Code MCP Server Health Monitor
# This script monitors the health of the MCP server and can be used with monitoring tools

set -euo pipefail

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3456}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
LOG_FILE="${LOG_FILE:-/var/log/claude-mcp/health-monitor.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send alert function
send_alert() {
    local message="$1"
    local severity="${2:-warning}"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -s -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"Claude MCP Alert [$severity]: $message\"}" || true
    fi
}

# Check server health
check_health() {
    local response
    local http_code
    
    # Make health check request
    response=$(curl -s -w "\n%{http_code}" "$SERVER_URL/health" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" != "200" ]; then
        log "ERROR: Health check failed with HTTP code: $http_code"
        send_alert "Health check failed with HTTP code: $http_code" "error"
        return 1
    fi
    
    # Parse JSON response
    local health_data=$(echo "$response" | head -n-1)
    
    # Extract metrics using jq if available
    if command -v jq &> /dev/null; then
        local active_sessions=$(echo "$health_data" | jq -r '.sessions.active // 0')
        local session_limit=$(echo "$health_data" | jq -r '.sessions.limit // 0')
        local status=$(echo "$health_data" | jq -r '.status // "unknown"')
        
        log "Health check passed - Status: $status, Active sessions: $active_sessions/$session_limit"
        
        # Check session usage
        if [ "$active_sessions" -gt 0 ] && [ "$session_limit" -gt 0 ]; then
            local usage_percent=$((active_sessions * 100 / session_limit))
            if [ "$usage_percent" -gt 90 ]; then
                log "WARNING: Session usage is high: ${usage_percent}%"
                send_alert "Session usage is high: ${usage_percent}% ($active_sessions/$session_limit)" "warning"
            fi
        fi
    else
        log "Health check passed (jq not available for detailed parsing)"
    fi
    
    return 0
}

# Check systemd service status
check_service() {
    if systemctl is-active --quiet claude-mcp.service; then
        log "Service is active"
    else
        log "ERROR: Service is not active"
        send_alert "Claude MCP service is not active" "error"
        return 1
    fi
    
    # Check for recent restarts
    local restart_count=$(systemctl show claude-mcp.service -p NRestarts --value 2>/dev/null || echo "0")
    if [ "$restart_count" -gt 5 ]; then
        log "WARNING: Service has restarted $restart_count times"
        send_alert "Service has restarted $restart_count times" "warning"
    fi
}

# Check disk space
check_disk_space() {
    local usage=$(df -h /opt/stacks/claude-code-mcp | awk 'NR==2 {print $(NF-1)}' | sed 's/%//')
    if [ "$usage" -gt 90 ]; then
        log "WARNING: Disk usage is high: ${usage}%"
        send_alert "Disk usage is high: ${usage}%" "warning"
    fi
}

# Check log file size
check_logs() {
    local log_dir="/var/log/claude-mcp"
    if [ -d "$log_dir" ]; then
        local total_size=$(du -sh "$log_dir" 2>/dev/null | cut -f1)
        log "Log directory size: $total_size"
        
        # Find large log files
        find "$log_dir" -type f -size +100M -exec ls -lh {} \; | while read -r line; do
            log "WARNING: Large log file found: $line"
        done
    fi
}

# Main monitoring loop
main() {
    log "Starting Claude MCP health monitor"
    
    # Create log directory if needed
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Run checks
    local exit_code=0
    
    echo -e "${GREEN}=== Claude MCP Health Check ===${NC}"
    
    # Check service
    echo -n "Checking service status... "
    if check_service; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        exit_code=1
    fi
    
    # Check health endpoint
    echo -n "Checking health endpoint... "
    if check_health; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        exit_code=1
    fi
    
    # Check disk space
    echo -n "Checking disk space... "
    check_disk_space
    echo -e "${GREEN}OK${NC}"
    
    # Check logs
    echo -n "Checking logs... "
    check_logs
    echo -e "${GREEN}OK${NC}"
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}All checks passed${NC}"
    else
        echo -e "\n${RED}Some checks failed${NC}"
    fi
    
    return $exit_code
}

# Run main function
main "$@"