package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_about_car.*

class AboutCarActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_about_car)

        buttonAboutCarFurther.setOnClickListener(){
            val intent: Intent = Intent(this, CarSuggestionsActivity::class.java)
            startActivity(intent)
        }

        buttonAboutCarTryAgain.setOnClickListener(){
            val intent: Intent = Intent(this, StartActivity::class.java)
            startActivity(intent)
        }
    }
}
