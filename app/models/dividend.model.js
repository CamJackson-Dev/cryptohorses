const mongoose = require("mongoose");

const DividendDataSchema = mongoose.Schema(
    {
        distributionNumber: {
          type: Number,
          required: true,
          defaultTo: 0
        },
        totalDistributedAmount: {
          type: Number,
          required: true,
          defaultTo: 0
        },
        successfullyPaidAmount: {
          type: Number,
          required: true,
          defaultTo: 0
        },
        txIdAndStatus: {
            type: [
              {
                transactionId: {
                  type: String,
                  trim: true,
                  required: true
                },
                txStatus: {
                  type: String,
                  trim: true,
                  required: true
                },
                min: {
                  type: Number,
                  required: true
                },
                max: {
                  type: Number,
                  required: true
                }
              }
            ],
            required: false
          }
      },
      {
        timestamps: true
      }
);

module.exports = mongoose.model("DividendData", DividendDataSchema);
