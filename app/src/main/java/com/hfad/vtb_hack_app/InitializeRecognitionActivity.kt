package com.hfad.vtb_hack_app

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.MediaStore
import khttp.post
import kotlinx.android.synthetic.main.activity_initialize_recognition.*
import org.json.JSONException
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.lang.Thread.sleep



lateinit var answer:JSONObject


fun  getRecognizedCarTEXT(photo: String) : JSONObject {
    val url = "https://gw.hackathon.vtb.ru/vtb/hackathon/car-recognize"
    val headers=mapOf("Accept" to "application/json",
        "Content-Type" to "application/json",
        "X-IBM-Client-Id" to "0addb468a816d42f276fbd1f810c9527")
    var payload = JSONObject()
    payload.put("content", photo)
    var payloadString = payload.toString().replace("\\n", "").replace("\\", "")
    //println(payloadString)
    val r = post(url, headers = headers, data = payloadString)
    return r.jsonObject
}

class SimpleThread(private val str: String): Thread() {

    public override fun run() {
        val sometext=getRecognizedCarTEXT(str)

        answer=sometext
    }
}


class InitializeRecognitionActivity : AppCompatActivity() {
    val REQUEST_IMAGE_CAPTURE = 1
    val REQUEST_GALLERY = 2
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_initialize_recognition)

        buttonStartRecognitionFromGallery.setOnClickListener(){
            dispatchTakePictureFromGalleryIntent()
        }

        buttonStartRecognitionByPhoto.setOnClickListener(){
            dispatchTakePictureIntent()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)



        if (resultCode == RESULT_OK && data != null) {

            when (requestCode) {

                REQUEST_GALLERY -> {
                    val selectedImage: Uri = data?.data!!

                    val imageStream: InputStream? = contentResolver.openInputStream(selectedImage)
                    val imageBitmap = BitmapFactory.decodeStream(imageStream)
                    val resized = getResizedBitmap(imageBitmap, 200)//maxSize варьируется

                    //кодируем в base64
                    val byteArrayOutputStream = ByteArrayOutputStream()
                    resized!!.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
                    val byteArray: ByteArray = byteArrayOutputStream.toByteArray()
                    val photoString = android.util.Base64.encodeToString(
                        byteArray,
                        android.util.Base64.DEFAULT
                    )

                    //ставим картиночку в imageView, по сути не нужно
                    //imageView.setImageBitmap(resized)


                    val newThrd = SimpleThread(photoString)
                    newThrd.start()

                    sleep(1000)//тут надо покопаться, сколько ожидание поставить

                    //textView.text = answer
                }

                REQUEST_IMAGE_CAPTURE -> {
                    val imageBitmap = data?.extras?.get("data") as Bitmap

                    //ставим картиночку в imageView, по сути не нужно
                    //imageView.setImageBitmap(imageBitmap)

                    //кодируем в base64
                    val byteArrayOutputStream = ByteArrayOutputStream()
                    imageBitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
                    val byteArray: ByteArray = byteArrayOutputStream.toByteArray()
                    val photoString = android.util.Base64.encodeToString(
                        byteArray,
                        android.util.Base64.DEFAULT
                    )
                    println("STRING HERE:")
                    println(photoString)


                    val newThrd = SimpleThread(photoString)
                    newThrd.start()


                    sleep(1000)//тут надо покопаться, сколько ожидание поставить

                    //textView.text = answer
                }


            }

            val resultCar:String = takeMostLikelyCar(answer)

            if (resultCar=="CAR NOT FOUND"){
                val intent:Intent = Intent(this, CarNotFoundActivity::class.java)
                startActivity(intent)
            }
            else
            {
                val intent:Intent = Intent(this, AboutCarActivity::class.java)
                startActivity(intent)
            }

        }
    }

    fun takeMostLikelyCar(jsonObject: JSONObject):String {
        val takerJSONObject = jsonObject
        var hashmap: HashMap<String, Double> = HashMap<String, Double>()
        try{
            if (takerJSONObject.get("probabilities") != null) {
                val mapka = takerJSONObject.get("probabilities") as JSONObject
                hashmap["BMW 3"] = mapka.getDouble("BMW 3")
                hashmap["BMW 5"] = mapka.getDouble("BMW 5")
                hashmap["Cadillac ESCALADE"] = mapka.getDouble("Cadillac ESCALADE")
                hashmap["Chevrolet Tahoe"] = mapka.getDouble("Chevrolet Tahoe")
                hashmap["Hyundai Genesis"] = mapka.getDouble("Hyundai Genesis")
                hashmap["Jaguar F-PACE"] = mapka.getDouble("Jaguar F-PACE")
                hashmap["KIA K5"] = mapka.getDouble("KIA K5")
                hashmap["KIA Optima"] = mapka.getDouble("KIA Optima")
                hashmap["KIA Sportage"] = mapka.getDouble("KIA Sportage")
                hashmap["Land Rover RANGE ROVER VELAR"] = mapka.getDouble("Land Rover RANGE ROVER VELAR")
                hashmap["Mazda 3"] = mapka.getDouble("Mazda 3")
                hashmap["Mazda 6"] = mapka.getDouble("Mazda 6")
                hashmap["Mercedes A"] = mapka.getDouble("Mercedes A")
                hashmap["Toyota Camry"] = mapka.getDouble("Toyota Camry")

                //добавить дополнительные машины

                //val gson = Gson()
                var max = hashmap.maxBy { it.value }
                if (max!!.value > 0.1) { // 0.1 - минимальная вероятность "опознания"
                    val res: String = max.key
                    return res
                }
            }

        }
        catch (e: JSONException){
            return "CAR NOT FOUND"
        }
        return "CAR NOT FOUND"
    }


     fun dispatchTakePictureIntent() {
        val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        try {
            startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
        } catch (e: ActivityNotFoundException) {
            // display error state to the user
        }
    }

    fun dispatchTakePictureFromGalleryIntent() {
        val takePictureIntent = Intent(Intent.ACTION_PICK)
        takePictureIntent.type = "image/*"
        takePictureIntent.action= Intent.ACTION_GET_CONTENT
        try {
            startActivityForResult(
                Intent.createChooser(takePictureIntent, "Pick an image"),
                REQUEST_GALLERY
            )
        } catch (e: ActivityNotFoundException) {
            // display error state to the user
        }
    }

    fun getResizedBitmap(image: Bitmap, maxSize: Int): Bitmap? {
        var width = image.width
        var height = image.height
        val bitmapRatio = width.toFloat() / height.toFloat()
        if (bitmapRatio > 1) {
            width = maxSize
            height = (width / bitmapRatio).toInt()
        } else {
            height = maxSize
            width = (height * bitmapRatio).toInt()
        }
        return Bitmap.createScaledBitmap(image, width, height, true)
    }
}