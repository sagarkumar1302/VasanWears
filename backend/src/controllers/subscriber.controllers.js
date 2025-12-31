import { Subscriber } from "../model/subscriber.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * SUBSCRIBE TO NEWSLETTER
 * @route POST /api/subscribers
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    let { email } = req.body;
    
    console.log(email);
    

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Email is required"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid email address"));
    }

    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res
        .status(200)
        .json(new ApiResponse(200, "You are already subscribed"));
    }

    await Subscriber.create({ email });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Subscribed successfully to newsletter"
        )
      );
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(200)
        .json(new ApiResponse(200, "You are already subscribed"));
    }

    return res
      .status(500)
      .json(new ApiResponse(500, error.message));
  }
};

