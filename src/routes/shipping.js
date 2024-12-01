import express from 'express';
import ShippingAddress from '../models/ShippingAddress.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all shipping addresses for the current user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching addresses for user:', req.user.id);
    const addresses = await ShippingAddress.find({ user: req.user.id });
    console.log('Found addresses:', addresses);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new shipping address
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new address for user:', req.user.id);
    console.log('Address data:', req.body);
    
    const {
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = req.body;

    const address = new ShippingAddress({
      user: req.user.id,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    });

    console.log('Saving address:', address);
    await address.save();
    console.log('Address saved successfully');
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a shipping address
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating address for user:', req.user.id);
    console.log('Address ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const address = await ShippingAddress.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!address) {
      console.log('Address not found');
      return res.status(404).json({ message: 'Address not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(update => {
      address[update] = updates[update];
    });

    console.log('Saving updated address:', address);
    await address.save();
    console.log('Address updated successfully');
    res.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a shipping address
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting address for user:', req.user.id);
    console.log('Address ID:', req.params.id);
    
    const address = await ShippingAddress.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!address) {
      console.log('Address not found');
      return res.status(404).json({ message: 'Address not found' });
    }

    console.log('Address deleted successfully');
    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set an address as default
router.patch('/:id/set-default', auth, async (req, res) => {
  try {
    console.log('Setting address as default for user:', req.user.id);
    console.log('Address ID:', req.params.id);
    
    // First, unset all default addresses for this user
    console.log('Unsetting default addresses');
    await ShippingAddress.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    // Then set the selected address as default
    console.log('Setting address as default');
    const address = await ShippingAddress.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      console.log('Address not found');
      return res.status(404).json({ message: 'Address not found' });
    }

    console.log('Address set as default successfully');
    res.json(address);
  } catch (error) {
    console.error('Error setting address as default:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shipping rates
router.get('/rates', async (req, res) => {
    try {
        // 这里是示例运费率，实际应用中可能需要根据具体业务逻辑计算
        const shippingRates = [
            {
                id: 'standard',
                name: '标准配送',
                price: 10.00,
                estimatedDays: '3-5'
            },
            {
                id: 'express',
                name: '快速配送',
                price: 20.00,
                estimatedDays: '1-2'
            }
        ];
        res.json(shippingRates);
    } catch (error) {
        console.error('Error getting shipping rates:', error);
        res.status(500).json({ message: 'Error fetching shipping rates' });
    }
});

export default router;
