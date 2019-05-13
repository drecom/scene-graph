//-----------------------------------------------------------------
/*!
    @file   FacialOffset.cs

    @brief  フェイシャルのスクリプト.

    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class FacialOffset : MonoBehaviour
{
    // 敵かACTか
    private enum Mode
    {
        NONE,
        ACT,
        MST,
    };

    private Mode m_mode = Mode.NONE;

    public GameObject jointController = null;
    public int frameRate = 30;

    [System.Serializable]
    public class FacialParam
    {
        public int index;
        public Vector2 offset;
    }

    public FacialParam[] EyeOffset;
    public FacialParam[] MouthOffset;

    private Renderer rend = null;
    private float timer = 0;

    // 目の標準オフセット(ACT)
    Dictionary<int, Vector2> eyeTable = new Dictionary<int, Vector2>()
    {
        {1, new Vector2(1.0f, 1f)},
        {2, new Vector2(1.0f, 0.75f)},
        {3, new Vector2(1f, 0.5f)},
        {4, new Vector2(1f, 0.25f)},
        {5, new Vector2(0.5f, 1.0f)},
        {6, new Vector2(0.5f, 0.75f)},
        {7, new Vector2(0.5f, 0.5f)},
        {8, new Vector2(0.5f, 0.25f)},
    };

    // 口の標準オフセット(ACT)
    Dictionary<int, Vector2> mouthTable = new Dictionary<int, Vector2>()
    {
        {1, new Vector2(1.0f, 1f)},
        {2, new Vector2(1.0f, 0.75f)},
        {3, new Vector2(1f, 0.5f)},
        {4, new Vector2(1f, 0.25f)},
        {5, new Vector2(0.5f, 1.0f)},
        {6, new Vector2(0.5f, 0.75f)},
        {7, new Vector2(0.5f, 0.5f)},
        {8, new Vector2(0.5f, 0.25f)},
    };

    void Awake()
    {
        // インスペクタからの設定で上書きする
        if (EyeOffset != null && EyeOffset.Length > 0)
        {
            eyeTable.Clear();
            foreach (var eye in EyeOffset)
            {
                eyeTable.Add(eye.index, eye.offset);
            }
        }

        // インスペクタからの設定で上書きする
        if (MouthOffset != null && MouthOffset.Length > 0)
        {
            mouthTable.Clear();
            foreach (var mouth in MouthOffset)
            {
                mouthTable.Add(mouth.index, mouth.offset);
            }
        }
        rend = GetComponent<Renderer>();
        
        // 動作モードを取得
        if( rend != null )
        {
            if( rend.material.shader.name.Equals("SDR/SDR_CHR") ) {
                m_mode = Mode.ACT;
            }

            if( rend.material.shader.name.Equals("SDR/SDR_CHR_Monster_S") ) {
                m_mode = Mode.MST;
            }
        }
    }

    void Update()
    {
        if (timer <= 0)
        {
            if (jointController != null)
            {
                int jointScaleEye = (int)Mathf.Round(jointController.transform.localScale.x);
                int jointScaleMouth = (int)Mathf.Round(jointController.transform.localScale.y);

                    // ACT
                    if( m_mode == Mode.ACT ) {
                    #if UNITY_EDITOR
                    try {
                    #endif
                        rend.material.SetTextureOffset("_eyesTex", eyeTable[jointScaleEye]);
                        rend.material.SetTextureOffset("_mouthTex", mouthTable[jointScaleMouth]);
                    #if UNITY_EDITOR
                    } catch( System.Exception ex )
                    {
                        Debug.Log(ex);
                        return;
                    }
                    #endif
                    }

                    // MST
                    if( m_mode == Mode.MST ) {
                    #if UNITY_EDITOR
                    try {
                    #endif
                        rend.material.SetTextureOffset("_eyesTex", eyeTable[jointScaleEye]);
                    #if UNITY_EDITOR
                    } catch( System.Exception ex )
                    {
                        Debug.Log(ex);
                        return; 
                    }
                    #endif
                    }

                timer = (1 / (float)frameRate);
            }
        }
        else
        {
            timer -= Time.deltaTime;
        }
    }
}
