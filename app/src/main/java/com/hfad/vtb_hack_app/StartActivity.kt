package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_credit_money_calculation.*
import kotlinx.android.synthetic.main.activity_start.*

class StartActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_start)

        buttonStartRecognition.setOnClickListener(){
            val intent: Intent = Intent(this, InitializeRecognitionActivity::class.java)
            startActivity(intent)
        }
    }
}