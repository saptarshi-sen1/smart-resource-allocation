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
    private val webAppUrl = "https://smart-resource-allocatio-ff7e5.web.app/" 
    
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        filePathCallback?.onReceiveValue(uris.toTypedArray())
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Set proper theme before onCreate
        setupThemeMode()
        setTheme(R.style.Theme_WebApp)
        super.onCreate(savedInstanceState)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        setupSwipeRefresh()
        setupOfflineLayout()

        loadWebApp()
    }

    private fun setupThemeMode() {
        val nightModeFlags = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
        if (nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES) {
            // Optional: Set some flags for dark mode if needed
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                useWideViewPort = true
                loadWithOverviewMode = true
                allowFileAccess = true
                mediaPlaybackRequiresUserGesture = false
                
                // CRITICAL: Custom UserAgent to allow Google Login in WebView
                // We remove "wv" from the string which Google uses to detect and block WebViews
                val defaultUA = userAgentString
                userAgentString = defaultUA.replace("; wv", "")
                    .replace("Version/\\d+\\.\\d+\\s".toRegex(), "")
                
                // Enable Dark Mode support for WebView content
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    val nightModeFlags = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
                    if (nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES) {
                        forceDark = WebSettings.FORCE_DARK_ON
                    } else {
                        forceDark = WebSettings.FORCE_DARK_OFF
                    }
                }
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    binding.progressBar.visibility = View.VISIBLE
                    binding.loadingText.visibility = View.VISIBLE
                    binding.offlineLayout.visibility = View.GONE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                    binding.loadingText.visibility = View.GONE
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
                    
                    // Allow Firebase Auth and Google Login URLs to stay in the WebView
                    if (url.startsWith(webAppUrl) || 
                        url.contains("accounts.google.com") || 
                        url.contains("firebaseapp.com")) {
                        return false 
                    }
                    
                    // Open external links in browser
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
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
        binding.loadingText.visibility = View.GONE
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
