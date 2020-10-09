package com.hfad.vtb_hack_app

import android.R.attr.bitmap
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.provider.MediaStore
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_main.*
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import khttp.*

class MainActivity : AppCompatActivity() {
    val REQUEST_IMAGE_CAPTURE = 1
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        buttonIdentifyCar.setOnClickListener(){

            /* intent = Intent()
            intent.setAction(Intent.ACTION_CAMERA_BUTTON)
            intent.putExtra(Intent.EXTRA_KEY_EVENT,  KeyEvent(KeyEvent.ACTION_DOWN,
                KeyEvent.KEYCODE_CAMERA)
            );
            sendOrderedBroadcast(intent, null); */

            dispatchTakePictureIntent()

        }



    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
            val imageBitmap = data?.extras?.get("data") as Bitmap
            imageView.setImageBitmap(imageBitmap)

            //encode to 64
            //val byte = imageBitmap.convertToByteArray()


            //val base64 =android.util.Base64.decode(byte, android.util.Base64.DEFAULT)
            //textView.text = byte[5].toString()

            val byteArrayOutputStream = ByteArrayOutputStream()
            imageBitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
            val byteArray: ByteArray = byteArrayOutputStream.toByteArray()


            //val base64 =android.util.Base64.decode(byteArray, android.util.Base64.DEFAULT)

           // val base64 = Base64.getEncoder().encodeToString(byte)

            textView.text=android.util.Base64.encodeToString(byteArray ,android.util.Base64.DEFAULT )

        }
    }

    private fun dispatchTakePictureIntent() {
        val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        try {
            startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
        } catch (e: ActivityNotFoundException) {
            // display error state to the user
        }
    }

   /* private fun Bitmap.convertToByteArray(): ByteArray = ByteBuffer.allocate(byteCount).apply {
        copyPixelsToBuffer(this)
        rewind()
    }.array()

    */

    private fun takeResponseByBase64(bmpString:String){

    }






}

