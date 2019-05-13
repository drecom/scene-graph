//-----------------------------------------------------------------
/*!
    @file   TextureAlpha.shader
    
    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------
Shader "sphere/TextureAlpha"
{
	Properties
	{
		_MainTex ("Texture", 2D) 	= "white" {}
		_Color ("Color", Color) 	= (1,1,1,1)
		_Alpha ("Alpha", Range(0.0,1.0)) = 1.0
	}
	SubShader
	{

		ColorMask RGB
		Blend SrcAlpha OneMinusSrcAlpha
		ZWrite Off
		Tags {"Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent"}
		
		Pass
		{
			CGPROGRAM
			#pragma vertex 		vert
			#pragma fragment 	frag
			
			#include "UnityCG.cginc"
			
			sampler2D 	_MainTex;
			float4 		_MainTex_ST;
			
			fixed4		_Color;
			float       _Alpha;

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
				fixed4 final = tex2D(_MainTex, i.uv) * _Color;
				final.w *= _Alpha;
				return final;
			}
			ENDCG
		}
	}
}
