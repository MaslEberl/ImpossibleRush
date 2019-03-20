using UnityEngine;

public class Manager : MonoBehaviour
{
    bool end = false;

    public void EndGame()
    {
        if (end == false)
        {
            Debug.Log("GAME OVER");
            end = true;
        }
    }
}
