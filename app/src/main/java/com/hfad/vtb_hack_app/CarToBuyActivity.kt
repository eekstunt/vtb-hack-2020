package com.hfad.vtb_hack_app

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_car_to_buy.*
import kotlinx.android.synthetic.main.item_car_suggestion.*

class CarToBuyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_car_to_buy)

        buttonCarBuyInCredit.setOnClickListener(){
            val intent: Intent = Intent(this, CreditMoneyCalculationActivity::class.java)
            startActivity(intent)
        }

        setSupportActionBar(carToBuyToolbar)

        supportActionBar?.apply {
            // show back button on toolbar
            // on back button press, it will navigate to parent activity
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
    }
}