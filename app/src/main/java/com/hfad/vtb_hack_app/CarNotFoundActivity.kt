package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_car_not_found.*
import kotlinx.android.synthetic.main.item_car_suggestion.*

class CarNotFoundActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_car_not_found)

        buttonCarNotFoundToHome.setOnClickListener(){
            val intent: Intent = Intent(this, StartActivity::class.java)
            startActivity(intent)
        }

        buttonCarNotFoundTryAgain.setOnClickListener(){
            val intent: Intent = Intent(this, InitializeRecognitionActivity::class.java)
            startActivity(intent)
        }
    }
}