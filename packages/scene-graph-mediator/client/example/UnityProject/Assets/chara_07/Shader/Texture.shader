//-----------------------------------------------------------------
/*!
    @file   Texture.shader
    
    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------
Shader "sphere/Texture"
{
	Properties
	{
		_MainTex ("Texture", 2D) 	= "white" {}
		_Color ("Color", Color) 	= (1,1,1,1)
	}
	SubShader
	{

		ColorMask RGB
		Tags { "RenderType"="Opaque" "LightMode"="ForwardBase" }
		
		Pass
		{
			CGPROGRAM
			#pragma vertex 		vert
			#pragma fragment 	frag
			
			#include "UnityCG.cginc"
			
			sampler2D 	_MainTex;
			float4 		_MainTex_ST;
			
			fixed4		_Color;
			
			struct VertexInput
			{
				float4 vertex 	: POSITION;
				float2 uv 		: TEXCOORD0;
			};

			struct FragmentInput
			{
				float4 vertex 	: SV_POSITION;
				float2 uv 		: TEXCOORD0;
			};

			//==========================
            // Vertex Shader
            //==========================
			FragmentInput vert (VertexInput v)
			{
				FragmentInput o;
				o.vertex 	= UnityObjectToClipPos(v.vertex);
				o.uv 		= TRANSFORM_TEX(v.uv, _MainTex);
				return o;
			}

			//==========================
            // Fragment Shader
            //==========================
			fixed4 frag (FragmentInput i) : SV_Target
			{
				return tex2D(_MainTex, i.uv) * _Color;
			}
			ENDCG
		}
	}
}
