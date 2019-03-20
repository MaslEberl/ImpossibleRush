using UnityEngine;

public class followPlayer : MonoBehaviour
{

    public Transform player;
    public Vector3 cam;

    // Update is called once per frame
    void Update()
    {
        //Debug.Log(player.position);
        transform.position=player.position+cam;
        
    }
}
