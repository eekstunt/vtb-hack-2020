package com.hfad.vtb_hack_app

import android.R.attr.bitmap
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.os.AsyncTask
import android.os.Bundle
import android.provider.MediaStore
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_main.*
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

import khttp.post
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch


//функция отправки запроса
fun getRecognizedCarTEXT(photo: String) : String {
    val url = "https://gw.hackathon.vtb.ru/vtb/hackathon/car-recognize"
    val paramsMap: Map<String, String> = mapOf("content" to photo)
    val response = post(url, params = paramsMap)
    val obj : String = response.text
    return obj
}


class MainActivity : AppCompatActivity() {
    val REQUEST_IMAGE_CAPTURE = 1
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        buttonIdentifyCar.setOnClickListener(){
            dispatchTakePictureIntent()
        }

        buttonAboutCar.setOnClickListener(){
            val intent:Intent = Intent(this, AboutCarActivity::class.java)
            startActivity(intent)
        }

        buttonNotFound.setOnClickListener(){
            val intent:Intent = Intent(this, CarNotFoundActivity::class.java)
            startActivity(intent)
        }


    }



    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.menu_main, menu)
        return super.onCreateOptionsMenu(menu)
    }
    //обработка событий меню
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.action_settings->{
                intent = Intent(this, PropertiesActivity::class.java)
                startActivity(intent)
                return true
            }

        }
        return super.onOptionsItemSelected(item)
    }


    //Приняли фотку и обрабатываем ее, переводя в строку и отправляя запрос на сервер
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
            // var recognisedCarData:String=""
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
            val imageBitmap = data?.extras?.get("data") as Bitmap

            //ставим картиночку в imageView, по сути не нужно
            imageView.setImageBitmap(imageBitmap)

            //перевод фотки в строку
            val byteArrayOutputStream = ByteArrayOutputStream()
            imageBitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
            val byteArray: ByteArray = byteArrayOutputStream.toByteArray()
            val photoString = android.util.Base64.encodeToString(byteArray ,android.util.Base64.DEFAULT)



            //неработающая мазафака
             GlobalScope.launch(Dispatchers.IO) {
                 var recognisedCarData = getRecognizedCarTEXT(photoString)
            }


            //textView.text=recognisedCarData
        }
    }

    //Запускаем камеру и принимаем фотку в MainActivity
    private fun dispatchTakePictureIntent() {
        val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        try {
            startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
        } catch (e: ActivityNotFoundException) {
            // display error state to the user
        }
    }


    //я вообще не помню откуда это взялось
    private fun takeResponseByBase64(bmpString:String){

    }






}

