//-----------------------------------------------------------------
/*!
    @file   SDR_CHR_Alpha.shader
    
    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------
Shader "SDR/SDR_CHR_Alpha" {
    Properties {
        _alphaTex ("alphaTex", 2D) = "white" {}
        _matToon ("matToon", 2D) = "white" {}
        [HideInInspector]_Cutoff ("Alpha cutoff", Range(0,1)) = 0.5

        _MatrixWidth 	("Dither Matrix Width/Height", int) = 4  
        _MatrixTex 		("Dither Matrix", 2D) = "black" {}
        _Threshold 		("Dither Threshold", Range(0.0, 1.0) ) = 1.0
    }
    SubShader {
        Tags {
            "IgnoreProjector"="True"
            "Queue"="Transparent"
            "RenderType"="Transparent"
        }
        LOD 200
        Pass {
            Name "FORWARD"
            Tags {
                "LightMode"="ForwardBase"
            }
            Blend SrcAlpha OneMinusSrcAlpha
            Cull Off
            ZWrite Off
            ColorMask RGB
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #define UNITY_PASS_FORWARDBASE
            #include "UnityCG.cginc"
            #pragma multi_compile_fwdbase
            #pragma multi_compile_fog
            //#pragma exclude_renderers gles3 metal d3d11_9x xbox360 xboxone ps3 ps4 psp2 
			#pragma exclude_renderers d3d11_9x xbox360 xboxone ps3 ps4 psp2
            #pragma target 3.0
            uniform sampler2D _alphaTex; uniform float4 _alphaTex_ST;
            uniform sampler2D _matToon; uniform float4 _matToon_ST;

			uniform int 		_MatrixWidth;  
			uniform sampler2D 	_MatrixTex;  
			uniform float 		_Threshold;

            struct VertexInput {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float2 texcoord0 : TEXCOORD0;
            };
            struct VertexOutput {
                float4 pos : SV_POSITION;
                float2 uv0 : TEXCOORD0;
                float4 posWorld : TEXCOORD1;
                float3 normalDir : TEXCOORD2;
                float4 	screenPos	: TEXCOORD5;
                UNITY_FOG_COORDS(3)
            };
            VertexOutput vert (VertexInput v) {
                VertexOutput o = (VertexOutput)0;
                o.uv0 = v.texcoord0;
                o.normalDir = UnityObjectToWorldNormal(v.normal);
                o.posWorld = mul(unity_ObjectToWorld, v.vertex);
                o.pos = UnityObjectToClipPos(v.vertex );
                o.screenPos 	= ComputeScreenPos(o.pos);
                UNITY_TRANSFER_FOG(o,o.pos);
                return o;
            }
            float4 frag(VertexOutput i, float facing : VFACE) : COLOR {

            	// スクリーン平面に対してマトリックステクスチャを敷き詰める  
	            float2 uv_MatrixTex = i.screenPos.xy / i.screenPos.w * _ScreenParams.xy / _MatrixWidth;
	            float threshold = tex2D(_MatrixTex, uv_MatrixTex).r;  
	            clip( threshold - (1.0f - _Threshold) );

                float isFrontFace = ( facing >= 0 ? 1 : 0 );
                float faceSign = ( facing >= 0 ? 1 : -1 );
                i.normalDir = normalize(i.normalDir);
                i.normalDir *= faceSign;
                float3 viewDirection = normalize(_WorldSpaceCameraPos.xyz - i.posWorld.xyz);
                float3 normalDirection = i.normalDir;
////// Lighting:
////// Emissive:
                float4 node_9104 = tex2D(_alphaTex,TRANSFORM_TEX(i.uv0, _alphaTex));
                float2 node_4752 = (mul( UNITY_MATRIX_V, float4(normalDirection,0) ).xyz.rgb.rg*0.5+0.5);
                float4 node_3110 = tex2D(_matToon,TRANSFORM_TEX(node_4752, _matToon));
                float3 emissive = (node_9104.rgb+(2.0*node_3110.rgb)+(-1.0));
                float3 finalColor = emissive;
                fixed4 finalRGBA = fixed4(finalColor,node_9104.a);
                UNITY_APPLY_FOG(i.fogCoord, finalRGBA);
                return finalRGBA;
            }
            ENDCG
        }
    }
    FallBack "Diffuse"
    CustomEditor "ShaderForgeMaterialInspector"
}
