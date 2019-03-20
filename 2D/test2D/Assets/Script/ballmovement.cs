using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ballmovement : MonoBehaviour
{
    public Rigidbody rb; // var um bestimmtes Rigidbody zu referencen -> public um in inspector zu bearbeiten
    public float gravety = 2000f;
   

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Hello World"); //console ausgabe
        //rb.useGravity = false;
        //rb.AddForce(0,200,500);
    }

    // Update is called once per frame
    void FixedUpdate() //FixedUpdate > Update weil Unity mag lieber
    {
        transform.position += new Vector3(0, -1*Time.deltaTime, 0);

    }
}
