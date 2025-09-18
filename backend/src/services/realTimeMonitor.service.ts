// Real-time performance monitoring and optimization
export class RealTimeMonitor {
  private responseTimings: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();
  
  /**
   * Track response time for performance monitoring
   */
  startTimer(userId: string): void {
    this.responseTimings.set(userId, Date.now());
  }
  
  /**
   * End timer and emit performance metrics
   */
  endTimer(userId: string, socket: any): number {
    const startTime = this.responseTimings.get(userId);
    if (!startTime) return 0;
    
    const responseTime = Date.now() - startTime;
    this.responseTimings.delete(userId);
    
    // Emit performance metrics to frontend
    socket.emit("performance_metrics", {
      responseTime,
      isSlowResponse: responseTime > 5000, // 5 seconds threshold
      timestamp: new Date().toISOString()
    });
    
    // Log slow responses
    if (responseTime > 3000) {
      console.warn(`[PERFORMANCE] Slow response for user ${userId}: ${responseTime}ms`);
    }
    
    return responseTime;
  }
  
  /**
   * Track errors for monitoring
   */
  trackError(userId: string, errorType: string): void {
    const key = `${userId}:${errorType}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    
    // Alert for frequent errors
    if (count >= 3) {
      console.error(`[ERROR_MONITOR] Frequent errors for user ${userId}: ${errorType} (${count + 1} times)`);
    }
  }
  
  /**
   * Check connection health
   */
  checkConnectionHealth(socket: any): boolean {
    try {
      // Ping test
      socket.emit("ping");
      return true;
    } catch (error) {
      console.error("[CONNECTION] Health check failed:", error);
      return false;
    }
  }
  
  /**
   * Monitor streaming performance
   */
  monitorStreamingHealth(socket: any, streamStartTime: number): void {
    const streamDuration = Date.now() - streamStartTime;
    
    if (streamDuration > 30000) { // 30 seconds timeout
      console.warn(`[STREAM] Long-running stream detected: ${streamDuration}ms`);
      socket.emit("stream_warning", { 
        message: "Response is taking longer than usual...",
        duration: streamDuration 
      });
    }
  }
}