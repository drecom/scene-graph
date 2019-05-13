//-----------------------------------------------------------------
/*!
    @file   SDR_CHR.shader
    
    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------
Shader "SDR/SDR_CHR"
{
    Properties
    {
        _matMetal ("matMetal", 2D)  = "white" {}
        _matToon ("matToon", 2D)    = "white" {}
        _maskTex ("maskTex", 2D)    = "white" {}
        _diffuse ("diffuse", 2D)    = "white" {}
        _eyesTex ("eyesTex", 2D)    = "white" {}
        _mouthTex ("mouthTex", 2D)  = "white" {}

        _MatrixWidth 	("Dither Matrix Width/Height", int)     = 4  
        _MatrixTex 		("Dither Matrix", 2D)                   = "black" {}
        _Threshold 		("Dither Threshold", Range(0.0, 1.0) )  = 1.0
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 100
        
        Pass
        {
            Name "FORWARD"
            Tags { "LightMode"="ForwardBase" }
            Cull Off
            
            CGPROGRAM
            #pragma vertex      vert
            #pragma fragment    frag

            #include "UnityCG.cginc"

            #pragma target 3.0

            uniform sampler2D   _matMetal;
            uniform sampler2D   _matToon;
            uniform sampler2D   _maskTex;
            uniform sampler2D   _diffuse;
            uniform sampler2D   _eyesTex;     uniform float4 _eyesTex_ST;
            uniform sampler2D   _mouthTex;    uniform float4 _mouthTex_ST;

			uniform int 		_MatrixWidth;  
			uniform sampler2D 	_MatrixTex;  
			uniform float 		_Threshold;

            struct VertexInput
            {
                float4 vertex       : POSITION;
                float3 normal       : NORMAL;
                float2 texcoord0    : TEXCOORD0;
                float2 texcoord1    : TEXCOORD1;
                float2 texcoord2    : TEXCOORD2;
            };

            struct VertexOutput
            {
                float4  pos             : SV_POSITION;                
                float4  uv01            : TEXCOORD0;
                float4  uv23            : TEXCOORD1;
                float4 	screenPos	    : TEXCOORD2;
                float2  screenParam     : TEXCOORD3;
            };

            VertexOutput vert (VertexInput v)
            {
                VertexOutput o  = (VertexOutput)0;
                o.pos           = UnityObjectToClipPos(v.vertex );
                o.screenPos 	= ComputeScreenPos(o.pos);
                o.uv01.xy       = v.texcoord0;
                o.uv01.zw       = v.texcoord1;
                o.uv23.xy       = v.texcoord2;
                float3 nor      = UnityObjectToWorldNormal( v.normal );                
                o.uv23.zw       = mul( UNITY_MATRIX_V, float4( nor, 0) ).xy * 0.5f + 0.5f;
                o.screenParam   = _ScreenParams.xy / _MatrixWidth;
                return o;
            }

            float4 frag(VertexOutput i) : COLOR
            {
	            float2 matrixUV = i.screenPos.xy / i.screenPos.w * i.screenParam;
	            fixed threshold = tex2D(_MatrixTex, matrixUV ).r;  
	            clip( threshold - (1.0f - _Threshold) );

                fixed4 matMetalTex  = tex2D(_matMetal, i.uv23.zw) * 2.0f;
                fixed4 matToolTex   = tex2D(_matToon,  i.uv23.zw) * 2.0f;
                
                fixed4 maskTex      = tex2D(_maskTex,  i.uv01.xy);
                fixed4 diffTex      = tex2D(_diffuse,  i.uv01.xy);
                fixed4 eyeTex       = tex2D(_eyesTex,  TRANSFORM_TEX(i.uv01.zw, _eyesTex) );
                fixed4 mouthTex     = tex2D(_mouthTex, TRANSFORM_TEX(i.uv23.xy , _mouthTex) );

                fixed3 a = lerp( matMetalTex.rgb, matToolTex.rgb, maskTex.r );
                fixed3 b = lerp( a + diffTex.rgb - 1.0f, diffTex.rgb, maskTex.g );
                fixed3 d = lerp( b, eyeTex.rgb,     maskTex.a * eyeTex.a );
                fixed3 e = lerp( d, mouthTex.rgb,   maskTex.a * mouthTex.a );
            
                return fixed4( e, maskTex.b );
            }
            ENDCG
        }
    }

    CustomEditor "ShaderForgeMaterialInspector"
}
