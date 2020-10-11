package com.hfad.vtb_hack_app

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_initialize_recognition.*

class InitializeRecognitionActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_initialize_recognition)

        buttonStartRecognitionFromGallery.setOnClickListener(){
            // TODO: сюда надо добавить переход в галерею
        }

        buttonStartRecognitionByPhoto.setOnClickListener(){
            // TODO: сюда надо добавить переход в камеру
        }
    }
}