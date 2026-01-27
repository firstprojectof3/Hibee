
package com.dpp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class UnlockReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent){
        /*사용자가 잠금을 해제했을 때 발생하는 신호*/
        if (intent.action == Intent.ACTION_USER_PRESENT){
            val prefs = context.getSharedPreferences("usage_prefs",Context.MODE_PRIVATE)
            val currentCount = prefs.getInt("unlock_count",0)
            prefs.edit().putInt("unlock_count",currentCount+1).apply()
        }
    }
}
