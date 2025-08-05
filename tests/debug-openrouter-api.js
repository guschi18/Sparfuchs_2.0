/**
 * DEBUG: OpenRouter API Call
 * Testet direkt die OpenRouter API mit detailliertem Logging
 */

async function debugOpenRouterAPI() {
  console.log('🔍 DEBUG: OpenRouter API Call');
  console.log('=============================');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('❌ OPENROUTER_API_KEY nicht gefunden');
    return;
  }
  
  console.log('🔑 API Key gefunden:', apiKey.substring(0, 20) + '...');
  
  const requestBody = {
    model: 'x-ai/grok-3-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Du bist ein deutscher Supermarkt-Assistent. Antworte nur auf Deutsch.' 
      },
      { 
        role: 'user', 
        content: 'Wo kann ich günstige Butter kaufen? Nenne 2 Supermärkte.' 
      }
    ],
    max_tokens: 200,
    temperature: 0.7,
    stream: false
  };
  
  console.log('📝 Request Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('🚀 Sending request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SparFuchs.de'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response Status:', response.status, response.statusText);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📝 Raw Response Text:');
    console.log(responseText);
    
    if (!response.ok) {
      console.log('❌ API Error Response');
      return;
    }
    
    const data = JSON.parse(responseText);
    console.log('✅ Parsed Response:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      console.log('\n🤖 AI Response:');
      console.log(aiResponse);
      
      console.log('\n📊 Response Analysis:');
      console.log('Length:', aiResponse.length, 'chars');
      console.log('Contains German:', /[äöüß]/.test(aiResponse) || aiResponse.includes('Supermarkt'));
      console.log('Contains Butter:', aiResponse.toLowerCase().includes('butter'));
      console.log('Contains Markets:', aiResponse.includes('Lidl') || aiResponse.includes('Aldi') || aiResponse.includes('Edeka'));
    }
    
    if (data.usage) {
      console.log('\n💰 Token Usage:');
      console.log('Prompt Tokens:', data.usage.prompt_tokens);
      console.log('Completion Tokens:', data.usage.completion_tokens);
      console.log('Total Tokens:', data.usage.total_tokens);
    }
    
  } catch (error) {
    console.log('❌ Request Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

// TEST AUSFÜHRUNG
debugOpenRouterAPI().catch(console.error);