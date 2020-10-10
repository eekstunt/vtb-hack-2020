package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_about_car.*

class AboutCarActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_about_car)

        buttonCarFurther.setOnClickListener(){
            val intent: Intent = Intent(this, CarNotFoundActivity::class.java)
            startActivity(intent)
        }

        buttonCarTryAgain.setOnClickListener(){
            val intent: Intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }
    }
}