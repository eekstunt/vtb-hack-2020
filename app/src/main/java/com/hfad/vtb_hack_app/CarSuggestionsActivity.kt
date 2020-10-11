package com.hfad.vtb_hack_app

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_car_suggestions_acivity.*
import kotlinx.android.synthetic.main.activity_car_to_buy.*
import kotlinx.android.synthetic.main.item_car_suggestion.*

class CarSuggestionsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_car_suggestions_acivity)

        buttonItemCarSuggestionOpen.setOnClickListener(){
            val intent: Intent = Intent(this, CarToBuyActivity::class.java)
            startActivity(intent)
        }

        setSupportActionBar(carSuggestionsToolbar)

        supportActionBar?.apply {
            // show back button on toolbar
            // on back button press, it will navigate to parent activity
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
    }
}