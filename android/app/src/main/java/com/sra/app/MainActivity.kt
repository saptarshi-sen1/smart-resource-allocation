package com.sra.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.sra.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    
    // REPLACE THIS WITH YOUR FIREBASE HOSTING URL
    // CORRECT FIREBASE HOSTING URL
    private val webAppUrl = "https://smart-resource-allocatio-ff7e5.web.app" 
    
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        filePathCallback?.onReceiveValue(uris.toTypedArray())
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_WebApp) // Remove splash screen theme
        super.onCreate(savedInstanceState)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        setupSwipeRefresh()
        setupOfflineLayout()

        loadWebApp()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportZoom(false)
                allowFileAccess = true
                mediaPlaybackRequiresUserGesture = false
                // FIX: Remove 'Version/X.X' to bypass 'disallowed_useragent' block by Google
                val defaultUA = userAgentString
                userAgentString = defaultUA.replace("; wv", "").replace("""Version/d+.d+s+""".toRegex(), "")
                
                // Enable multi-window for popups if needed, but we'll stick to redirect for app
                setSupportMultipleWindows(true)
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    binding.progressBar.visibility = View.VISIBLE
                    binding.offlineLayout.visibility = View.GONE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    if (request?.isForMainFrame == true) {
                        showOfflineLayout()
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url.toString()
                    // Allow the app URL, Google Auth, and Firebase Auth to load in the WebView
                    if (url.startsWith(webAppUrl) || 
                        url.contains("accounts.google.com") || 
                        url.contains("firebaseapp.com") ||
                        url.contains("google.com/accounts")) {
                        return false 
                    }
                    // Open other external links in browser
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (e: Exception) {
                        return false // Fallback to WebView if no browser found
                    }
                    return true
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback = filePathCallback
                    filePickerLauncher.launch("*/*") // Can be more specific based on requirements
                    return true
                }
            }
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            loadWebApp()
        }
    }

    private fun setupOfflineLayout() {
        binding.retryButton.setOnClickListener {
            loadWebApp()
        }
    }

    private fun loadWebApp() {
        if (isNetworkAvailable()) {
            binding.offlineLayout.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
            binding.webView.loadUrl(webAppUrl)
        } else {
            showOfflineLayout()
        }
    }

    private fun showOfflineLayout() {
        binding.webView.visibility = View.GONE
        binding.progressBar.visibility = View.GONE
        binding.swipeRefreshLayout.isRefreshing = false
        binding.offlineLayout.visibility = View.VISIBLE
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val activeNetwork = connectivityManager.getNetworkCapabilities(network) ?: return false
        return when {
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
            else -> false
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
