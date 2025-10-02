import Period from "../models/Period";

export class PeriodsController {
  
  static async savePeriod(req, res, next) {
    try {
      const { period_text, start_time, ending_time } = req.body;
      let period = req.body.period;

      //convert period into int
      period = parseInt(period);

      const isPeriod = await Period.findOne({ period: period });
      if (isPeriod) throw new Error("period already exist");

      const data = await new Period({
        period_text,
        period,
        start_time,
        ending_time,
      }).save();

      if (!data) throw new Error("Failed to add");

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPeriods(req, res, next) {
    try {
      const periods = await Period.find({});

      if (!periods) throw new Error("Periods not found!...");

      return res.json({
        success: true,
        data: periods,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePeriod(req, res, next) {
    try {
      const id = req.params.id || req.query.id;
      if (!id) throw new Error("id not available");

      const { period_text, start_time, ending_time } = req.body;
      //convert period into int

      let period = req.body.period;
      period = parseInt(period);

      const isUpdated = await Period.findOneAndUpdate(
        {
          _id: id,
        },
        {
          period_text,
          period,
          start_time,
          ending_time,
        },
        { new: true }
      );

      if (!isUpdated) throw new Error("failed to update");
    } catch (error) {
      next(error);
    }
  }

  static async deletePeriod(req, res, next) {
    try {
      const id = req.params.id || req.query.id;
      if (!id) throw new Error("Id not available");

      const isDeleted = await Period.findOneAndDelete({ _id: id });
      if (!isDeleted) throw new Error("Failed to delete");
      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
