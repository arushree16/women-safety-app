require('dotenv').config();
const mongoose = require('mongoose');
const HelpRequest = require('../models/HelpRequest');

async function testHelpRequest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create multiple test help requests with different timestamps
    const currentTime = new Date();
    const oldTime = new Date(currentTime.getTime() - (25 * 60 * 60 * 1000)); // 25 hours ago

    const testRequests = [
      {
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        timestamp: currentTime,
        description: 'Recent help request',
        userId: new mongoose.Types.ObjectId()
      },
      {
        location: {
          type: 'Point',
          coordinates: [77.2091, 28.6140] // Nearby coordinates
        },
        timestamp: oldTime,
        description: 'Old help request',
        userId: new mongoose.Types.ObjectId()
      }
    ];

    // Save the test requests
    const savedRequests = await HelpRequest.insertMany(testRequests);
    console.log('Test help requests created');

    // Test 1: Query recent incidents (within 24 hours)
    const recentIncidents = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          },
          $maxDistance: 500
        }
      },
      timestamp: {
        $gte: new Date(currentTime.getTime() - (24 * 60 * 60 * 1000))
      }
    });

    console.log('\nTest 1 - Recent incidents (should be 1):', recentIncidents.length);

    // Test 2: Query all incidents (no time filter)
    const allIncidents = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          },
          $maxDistance: 500
        }
      }
    });

    console.log('Test 2 - All incidents (should be 2):', allIncidents.length);

    // Test 3: Query incidents far away (should be 0)
    const farIncidents = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [78.2090, 29.6139] // Different location
          },
          $maxDistance: 500
        }
      }
    });

    console.log('Test 3 - Far incidents (should be 0):', farIncidents.length);

    // Clean up - delete test data
    const ids = savedRequests.map(request => request._id);
    await HelpRequest.deleteMany({ _id: { $in: ids } });
    console.log('\nTest data cleaned up');

    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');

  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.connection.close();
  }
}

testHelpRequest(); 