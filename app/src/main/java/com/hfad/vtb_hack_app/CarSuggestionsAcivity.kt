package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.item_car_suggestion.*

class CarSuggestionsAcivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_car_suggestions_acivity)

        buttonItemCarSuggestion.setOnClickListener(){
            val intent: Intent = Intent(this, CarToBuyActivity::class.java)
            startActivity(intent)
        }
    }
}