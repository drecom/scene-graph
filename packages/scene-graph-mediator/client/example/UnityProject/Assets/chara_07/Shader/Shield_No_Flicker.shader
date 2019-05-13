//-----------------------------------------------------------------
/*!
    @file   Shield_No_Flicker.shader
    
    Copyright(C) BANDAI NAMCO Entertainment Inc. All rights reserved.
*/
//-----------------------------------------------------------------
Shader "sphere/Shield_Flicker" {

	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
	    _AlphaTex ("AlphaAdd (RGB)", 2D) = "white" {}
		_RimColor ("Rim Color", Color) = (.5,.5,.5,.5)
		
		
		_RimPow("Rim Power", float) = 2
		_Power("Rim Strength", float) = 2

		_Speedx("UV Scroll x", float) = .3
		_Speedy("UV Scroll y", float) = .3

		[KeywordEnum(ON,OFF)] //OnOff option
		_ONOFF("Rim On/Off", int) = 0 //OnOff property


		[Enum(UnityEngine.Rendering.BlendMode)] _SrcMode("SrcMode", int) = 5  // SrcAlpha
		[Enum(UnityEngine.Rendering.BlendMode)] _DstMode("_DstMode", int) = 10  // OneMinusSrcAlpha
	}

	SubShader {
		Tags{ "RenderType" = "Transparent" "Queue" = "Transparent" }
		

		/*
		//LOD 100
		blend SrcAlpha One
		Cull Front
		ZWrite On


		
		//pass{1} Surface Shader don't use passes!
		CGPROGRAM

		#pragma surface surf Lambert alpha

		

		struct Input {

			float4 color : COLOR;
		};

		void surf(Input IN, inout SurfaceOutput o) {
			o.Emission =  IN.color.rgb;
			o.Alpha = 0;
		}

		ENDCG
		
		*/

		Blend[_SrcMode][_DstMode]
		Zwrite Off
		cull Back
		ColorMask RGB
		
		CGPROGRAM
		#pragma surface surf SimpleLambert keepalpha
		#pragma multi_compile _ONOFF_ON _ONOFF_OFF


		sampler2D _MainTex;
		sampler2D _AlphaTex;
		half4 _RimColor;
		half4 _Color;
		
		fixed _RimPow;
		fixed _Power;
		fixed _Speedx;
		fixed _Speedy;
		
	

		struct Input {
			float2 uv_MainTex;
			float2 uv_AlphaTex;
			
			//float3 worldNormal; // 버텍스 노말 
	

			float3 viewDir;
			float3 rimColor;
			float4 color : COLOR ;
		
		};

		half4 LightingSimpleLambert(SurfaceOutput s, half3 lightDir, half3 viewDir, half atten) {

			half factor = 1.0f;

			half rim = (1.0 - saturate(dot(normalize(viewDir), s.Normal)));


			#ifdef _ONOFF_ON
				factor = 2 * (abs(fmod(_Time.y * abs(_Speedx), 1) - 0.5) - 0.25); // sin like curve for mobile
		
			#elif _ONOFF_OFF
			  factor = 1.0f;

			#endif

			half4 c;
			
			c.rgb = s.Albedo  +  _RimColor.rgb * pow(rim, _RimPow) * (factor + _Power);
			c.a = s.Alpha + rim;
			
			return c;
		}


		void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);

			half4 d = tex2D(_AlphaTex, float2((IN.uv_AlphaTex.x - _Time.y * _Speedx), (IN.uv_AlphaTex.y - _Time.y * _Speedy)));
						
			
			o.Emission =  ( c.rgb * c.a  * d.rgb * d.a)  + .1 * _RimColor.rgb;

			o.Alpha = c.a * _RimColor.a;
					
			o.Albedo = 0;	
		}

		ENDCG
	} 
	FallBack "Diffuse"
}
