using UnityEngine;

public class Playermovement : MonoBehaviour
{

    public Rigidbody rb; // var um bestimmtes Rigidbody zu referencen -> public um in inspector zu bearbeiten
    public float forwardForce = 2000f;
    public float sidewaysForce = 500f;

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
        rb.AddForce(0, 0, forwardForce * Time.deltaTime); //depends on framerate -> Time.deltaTime ist Zeit seit letztem update und gleicht das aus

        if(Input.GetKey("d")) //wenn user D presst
        {
            rb.AddForce(sidewaysForce * Time.deltaTime, 0, 0,ForceMode.VelocityChange);
        }
        if (Input.GetKey("a")) //wenn user A presst
        {
            rb.AddForce(-sidewaysForce * Time.deltaTime, 0, 0, ForceMode.VelocityChange);
        }
        if (rb.position.y < -1f)
        {
            FindObjectOfType<Manager>().EndGame();
        }
    }
}
