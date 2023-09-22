const express = require('express')
const { subDays, startOfDay, endOfDay, format } = require('date-fns'); // Import date-fns library for date manipulation

const auth = require('../middleware/auth')
const Order = require('../models/order')

const router = new express.Router()

// GET DAILY ORDERS STATISTIC
// router.get('/daily-orders-statistic', auth, async (req, res) => {
//   try {
//     const dailyOrdersStatistic = await Order.aggregate([
//       {
//         $group: {
//           _id: {
//             year: { $year: '$createdAt' },
//             month: { $month: '$createdAt' },
//             day: { $dayOfMonth: '$createdAt' },
//           },
//           totalOrders: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           date: {
//             $dateFromParts: {
//               year: '$_id.year',
//               month: '$_id.month',
//               day: '$_id.day'
//             }
//           },
//           totalOrders: 1
//         }
//       }
//     ])
    
//     const modifiedResult = dailyOrdersStatistic.map((stat) => ({
//       dateAttributes: stat._id,
//       totalOrders: stat.totalOrders,
//       dateString: stat.date
//     }))

//     console.log({modifiedResult})
//     res.send(modifiedResult)
//   } catch (error) {
//     res.status(400).send(error)
//   }
// })


// GET DAILY ORDERS STATISTIC FOR LAST 10 DAYS
router.get('/daily-orders-statistic', auth, async (req, res) => {
  try {
    // Calculate the date range for the last 10 days
    const endDate = new Date(); // Current date
    console.log({endDate})
    const startDate = subDays(endDate, 9); // Subtract 9 days to get a 10-day range
    console.log({startDate})

    // Create an array to store daily order statistics
    const dailyOrdersStatistic = [];

    // Loop through each day in the date range
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const nextDate = endOfDay(currentDate); // Set the end of the current day
      const stats = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay(currentDate), // Start of the current day
              $lte: nextDate, // End of the current day
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
          },
        },
      ]);

      const totalOrders = stats.length > 0 ? stats[0].totalOrders : 0;

      // Add the daily order statistics to the array
      dailyOrdersStatistic.push({
        dateAttributes: {
          year: format(currentDate, 'yyyy'),
          month: format(currentDate, 'MM'),
          day: format(currentDate, 'dd'),
        },
        totalOrders,
        dateString: format(currentDate, 'yyyy-MM-dd'),
      });

      // Move to the next day
      currentDate = subDays(currentDate, -1); // Increment the date by 1 day
    }

    // console.log({ dailyOrdersStatistic })
    res.send(dailyOrdersStatistic);
  } catch (error) {
    res.status(400).send(error);
  }
})


// GET MONTHLY ORDERS STATISTIC
router.get('/monthly-orders-statistics', auth, async (req, res) => {
  try {
    const monthlyOrdersStatistic = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month'
            }
          },
          totalOrders: 1
        }
      }
    ])

    const modifiedResult = monthlyOrdersStatistic.map((stat) => ({
      dateAttributes: stat._id,
      totalOrders: stat.totalOrders,
      dateString: stat.date
    }))

    // console.log({modifiedResult})
    res.send(modifiedResult)
  } catch (error) {
    res.status(400).send(error)
  }
})

// GET YEARLY ORDERS STATISTIC
router.get('/yearly-orders-statistics', auth, async (req, res) => {
  try {
    const yearlyOrdersStatistic = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' }
          },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year'
            }
          },
          totalOrders: 1
        }
      }
    ])

    const modifiedResult = yearlyOrdersStatistic.map((stat) => ({
      dateAttributes: stat._id,
      totalOrders: stat.totalOrders,
      dateString: stat.date
    }))

    // console.log({modifiedResult})
    res.send(modifiedResult)
  } catch (error) {
    res.status(400).send(error)
  }
})

// GET TOP 3 BESTSELLING PRODUCTS
router.get('/top-3-bestsellers', auth, async (req, res) => {
  try {
    // Aggregate the orders to calculate the total quantity for each product
    const top3BestsellingProducts = await Order.aggregate([
      {
        $unwind: "$products"
      },
      {
        $group: {
          _id: "$products.product", // Group by product
          totalQuantity: { $sum: "$products.quantity" }, // Calculate the total quantity for each product
          mostRecentOrderDate: { $max: "$createdAt" } // Calculate the most recent order date for each product
        }
      },
      {
        // Sort by total quantity in descending order and then by most recent order date in descending order
        $sort: { totalQuantity: -1, mostRecentOrderDate: -1 }
      },
      {
        // Limit the results to the top 3 products
        $limit: 3
      }
    ])

    // Rename the '_id' key to 'product' in each of the top products for better association
    const renamedTop3Bestsellers = top3BestsellingProducts.map(product => {
      return {
        product: product._id,
        totalQuantity: product.totalQuantity,
        mostRecentOrderDate: product.mostRecentOrderDate
      };
    })

    const top3Bestsellers = {}
    const places = ['first', 'second', 'third']

    renamedTop3Bestsellers.slice(0, 3).forEach((product, index) => {
      top3Bestsellers[places[index]] = product;
    })

    console.log({top3BestsellingProducts}, {top3Bestsellers})
    res.send(top3Bestsellers)
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router