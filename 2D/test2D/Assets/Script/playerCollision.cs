using UnityEngine;

public class playerCollision : MonoBehaviour
{

    public Collision move;

    private void OnCollisionEnter()
    {
        //Debug.Log(collision.collider.name);
        if (move.collider.tag == "aaa")
        {
            Debug.Log("oefoihf");

        }
    }
}


