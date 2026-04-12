const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/models',     require('./routes/models'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/aimaster',   require('./routes/aimaster'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));