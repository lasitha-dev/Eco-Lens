const cron = require('node-cron');
const NotificationService = require('./NotificationService');
const User = require('../models/User');

/**
 * WeeklySummaryScheduler
 * Schedules and sends weekly sustainability summaries to users
 */
class WeeklySummaryScheduler {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  /**
   * Start the weekly summary cron job
   * Runs every Sunday at 9:00 AM UTC
   */
  start() {
    if (this.job) {
      console.log('⚠️  Weekly summary scheduler is already running');
      return;
    }

    // Cron expression: '0 9 * * 0' = Every Sunday at 9:00 AM UTC
    // For testing: '*/5 * * * *' = Every 5 minutes
    this.job = cron.schedule('0 9 * * 0', async () => {
      console.log('📅 Weekly summary job triggered at:', new Date().toISOString());
      await this.sendWeeklySummaries();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.isRunning = true;
    console.log('✅ Weekly summary scheduler started (Sundays at 9:00 AM UTC)');
  }

  /**
   * Stop the weekly summary cron job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      this.isRunning = false;
      console.log('🛑 Weekly summary scheduler stopped');
    }
  }

  /**
   * Send weekly summaries to all opted-in users
   */
  async sendWeeklySummaries() {
    try {
      console.log('🚀 Starting weekly summary batch send...');

      // Find all users who opted in for weekly summaries
      const users = await User.find({
        weeklySummaryOptIn: true,
        isActive: true
      }).select('_id firstName email');

      console.log(`📊 Found ${users.length} users opted in for weekly summaries`);

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      // Send summaries in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (user) => {
          try {
            const result = await NotificationService.sendWeeklySummary(user._id);
            
            if (result.success) {
              successCount++;
              console.log(`✅ Sent weekly summary to ${user.firstName} (${user.email})`);
            } else {
              failureCount++;
              console.log(`⚠️  Skipped ${user.firstName} (${user.email}): ${result.reason}`);
            }

            return {
              userId: user._id,
              email: user.email,
              success: result.success,
              tier: result.tier,
              pushSent: result.pushSent
            };
          } catch (error) {
            failureCount++;
            console.error(`❌ Error sending to ${user.firstName} (${user.email}):`, error.message);
            return {
              userId: user._id,
              email: user.email,
              success: false,
              error: error.message
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('📈 Weekly summary batch send completed:');
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log(`   📊 Total: ${users.length}`);

      return {
        total: users.length,
        success: successCount,
        failed: failureCount,
        results
      };
    } catch (error) {
      console.error('❌ Error in weekly summary batch send:', error);
      throw error;
    }
  }

  /**
   * Manually trigger weekly summaries (for testing)
   */
  async triggerManual() {
    console.log('🔧 Manually triggering weekly summaries...');
    return await this.sendWeeklySummaries();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.job ? 'Every Sunday at 9:00 AM UTC' : null
    };
  }
}

// Export singleton instance
module.exports = new WeeklySummaryScheduler();
