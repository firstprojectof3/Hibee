package com.dpp

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.util.Calendar

class UsageStatsModule(private val reactCtx: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactCtx) {

  override fun getName(): String = "UsageStatsModule"

  /**
   * 권한 확인: Usage Access(사용 기록 접근) 허용 여부
   */
  @ReactMethod
  fun checkPermission(promise: Promise) {
    promise.resolve(hasUsageAccessPermission(reactCtx))
  }

  /**
   * 설정 화면 이동: Usage Access 설정으로 이동
   */
  @ReactMethod
  fun showSettings() {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactCtx.startActivity(intent)
  }

  /**
   * 오늘 0시부터 현재까지의 앱 사용 기록 조회
   *
   * 반환 형식:
   * [
   *   { packageName: String, usageTime: Double(초), lastTimeUsed: Double(timestamp ms) },
   *   ...
   * ]
   */
  @ReactMethod
  fun getTodayUsage(promise: Promise) {
    if (!hasUsageAccessPermission(reactCtx)) {
      promise.reject("NO_PERMISSION", "Usage access not granted")
      return
    }

    val now = System.currentTimeMillis()
    val startOfDay = Calendar.getInstance().apply {
      timeInMillis = now
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    val usm = reactCtx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val stats: List<UsageStats> = usm.queryUsageStats(
      UsageStatsManager.INTERVAL_DAILY,
      startOfDay,
      now
    ) ?: emptyList()

    val result: WritableArray = Arguments.createArray()

    // UsageStatsManager.queryUsageStats()는 사용 기록이 없는 패키지도 반환할 수 있어 필터링 필수
    stats.forEach { s ->
      if (shouldInclude(s.packageName, s.totalTimeInForeground)) {
        // 1. 패키지명을 이용해 사람이 읽을 수 있는 앱 이름(Label) 추출
        val appLabel = try {
          val info = pm.getApplicationInfo(s.packageName, 0)
          pm.getApplicationLabel(info).toString()
        } catch (e: Exception) {
          s.packageName // 실패 시 패키지명 그대로 사용
        }

        val map: WritableMap = Arguments.createMap().apply {
          putString("packageName", s.packageName)
          putString("appName", appLabel) 
          putDouble("usageTime", s.totalTimeInForeground.toDouble() / 1000.0)
          
          // 2. 프론트엔드/백엔드 스키마에 필요한 타임스탬프 추가
          putDouble("firstTimeStamp", s.firstTimeStamp.toDouble()) 
          putDouble("lastTimeStamp", s.lastTimeStamp.toDouble())
          putDouble("lastTimeUsed", s.lastTimeUsed.toDouble())
        }
        result.pushMap(map)
      }
    }

    promise.resolve(result)
  }

  /**
   * 필터링 로직
   *
   * 1) totalTimeInForeground == 0 : 무조건 제외
   * 2) 화이트리스트: com.android.settings, com.android.vending 은 무조건 포함
   * 3) 블랙리스트: 화이트리스트가 아니면서 packageName에 systemui/launcher/keyboard/bluetooth/provider 포함 시 제외
   * 4) 그 외는 포함
   */
  private fun shouldInclude(packageName: String?, totalTimeInForegroundMs: Long): Boolean {
    if (packageName.isNullOrBlank()) return false
    if (totalTimeInForegroundMs <= 0L) return false

    // Whitelist
    if (packageName == "com.android.settings" || packageName == "com.android.vending") {
      return true
    }

    val lower = packageName.lowercase()

    // Blacklist keywords (system/background)
    val blacklist = listOf("systemui", "launcher", "keyboard", "bluetooth", "provider")
    if (blacklist.any { lower.contains(it) }) return false

    return true
  }

  private fun hasUsageAccessPermission(ctx: Context): Boolean {
    val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        ctx.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        ctx.packageName
      )
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }
}


