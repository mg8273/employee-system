const Employee = require('../models/Employee');

exports.getRecommendations = async (req, res) => {
  try {
    const employees = await Employee.find();
    if (employees.length === 0)
      return res.status(400).json({ message: 'No employees found' });

    const employeeList = employees.map(e =>
      `${e.name} - Dept: ${e.department}, Skills: ${e.skills.join(', ')}, Score: ${e.performanceScore}, Experience: ${e.experience} years`
    ).join('\n');

    const prompt = `You are an HR analyst. Analyze these employees and provide:
1. Promotion recommendations
2. Training suggestions  
3. Performance ranking
4. AI feedback for each

Employees:
${employeeList}

Give specific recommendations for each employee.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || 'No recommendation generated';
    res.json({ recommendation: aiText, employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
