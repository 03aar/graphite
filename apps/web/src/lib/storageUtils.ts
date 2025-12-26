/**
 * Storage utility for managing localStorage with quota management
 */

export interface StorageQuota {
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}

export class StorageManager {
  private static readonly WARNING_THRESHOLD = 0.8; // 80%
  private static readonly CRITICAL_THRESHOLD = 0.95; // 95%

  /**
   * Get current storage quota information
   */
  static async getQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;

        return {
          usage,
          quota,
          percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
          available: quota - usage,
        };
      } catch (error) {
        console.error('Failed to estimate storage:', error);
      }
    }

    // Fallback: estimate localStorage size
    const size = this.getLocalStorageSize();
    const estimatedQuota = 10 * 1024 * 1024; // 10MB typical

    return {
      usage: size,
      quota: estimatedQuota,
      percentUsed: (size / estimatedQuota) * 100,
      available: estimatedQuota - size,
    };
  }

  /**
   * Calculate approximate size of localStorage
   */
  static getLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
    }
    return total * 2; // Approximate bytes (UTF-16)
  }

  /**
   * Check if storage is approaching quota
   */
  static async checkStorageHealth(): Promise<{
    status: 'ok' | 'warning' | 'critical';
    quota: StorageQuota;
    message?: string;
  }> {
    const quota = await this.getQuota();

    if (quota.percentUsed >= this.CRITICAL_THRESHOLD * 100) {
      return {
        status: 'critical',
        quota,
        message: `Storage is ${quota.percentUsed.toFixed(1)}% full. Please delete old projects to free space.`,
      };
    }

    if (quota.percentUsed >= this.WARNING_THRESHOLD * 100) {
      return {
        status: 'warning',
        quota,
        message: `Storage is ${quota.percentUsed.toFixed(1)}% full. Consider cleaning up old projects.`,
      };
    }

    return {
      status: 'ok',
      quota,
    };
  }

  /**
   * Safely set item in localStorage with quota check
   */
  static safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        this.handleQuotaExceeded();
        return false;
      }
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Handle quota exceeded by cleaning up old data
   */
  private static handleQuotaExceeded(): void {
    // Emit event for UI to handle
    window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
      detail: { message: 'Storage quota exceeded. Please delete old projects.' },
    }));
  }

  /**
   * Clean up old projects (keep newest N)
   */
  static cleanupOldProjects(keepCount: number = 10): number {
    try {
      const projectsJson = localStorage.getItem('latex-projects');
      if (!projectsJson) return 0;

      const projects = JSON.parse(projectsJson);
      if (!Array.isArray(projects)) return 0;

      // Sort by updatedAt, newest first
      projects.sort((a: any, b: any) => b.updatedAt - a.updatedAt);

      // Keep only the newest ones
      const cleaned = projects.slice(0, keepCount);
      const removedCount = projects.length - cleaned.length;

      if (removedCount > 0) {
        localStorage.setItem('latex-projects', JSON.stringify(cleaned));
      }

      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup projects:', error);
      return 0;
    }
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
