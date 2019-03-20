using UnityEngine;

public class playerCollision : MonoBehaviour
{

    public Playermovement move;

    private void OnCollisionEnter(Collision collision)
    {
        //Debug.Log(collision.collider.name);
        if(collision.collider.tag == "Obstacle")
        {
            move.enabled = false;
            FindObjectOfType<Manager>().EndGame();
            
        }
    }

}
