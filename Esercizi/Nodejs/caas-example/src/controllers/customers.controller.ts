import { Request, Response, NextFunction} from 'express';
import logger from '../utils/logger';

export class CustomersController {

    async getAllCustomers(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            
        } catch (error) {
            logger.error('Error fetching customers', error);
            next(error);
        } finally {
            // Qualsiasi operazione di pulizia o logging può essere eseguita qui
            logger.info('Finished fetching customers');
        }
    }

    async getCustomerById(req: Request, res: Response, next: NextFunction) : Promise<void> {

    }

    async createCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {

    }

    async updateCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {

    }

    async deleteCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {

    }

}



export default new CustomersController();