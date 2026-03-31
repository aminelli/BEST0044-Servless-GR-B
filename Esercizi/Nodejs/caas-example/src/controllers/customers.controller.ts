import { Request, Response, NextFunction} from 'express';
import logger from '../utils/logger';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { Customer, PaginateResponse } from '../models/customer.model';
import { AppError } from '../middleware/errorHandler';

import { ResultSetHeader, RowDataPacket } from 'mysql2';


export class CustomersController {

    async getAllCustomers(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {

            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                logger.warn('Validation errors in getAllCustomers', { errors: errors.array() });
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = (req.query.search as string) || '';
            const sortBy = (req.query.sortBy as string) || 'created_at';
            const order = (req.query.order as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            const offset = (page - 1) * limit;

            let query = 'SELECT * FROM customers';
            let countQuery = 'SELECT COUNT(*) as total FROM customers';
            
            const queryParams: any[] = [];
            const countQueryParams: any[] = [];

            if (search) {
                const searchCondition = ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ? OR city LIKE ? OR state LIKE ? OR country LIKE ?';
                const searchTerm = `%${search}%`;
                query += searchCondition;
                countQuery += searchCondition;
                queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
                countQueryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
             
            query += ` ORDER BY ${sortBy} ${order}`;
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);
            
            const [customers] = await pool.execute<RowDataPacket[]>(query, queryParams);
            const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countQueryParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);


            const response: PaginateResponse<Customer> = {
                success: true,
                data: customers as Customer[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };

            res.status(200).json(response);


        } catch (error) {
            logger.error('Error fetching customers', error);
            next(error);
        } finally {
            // Qualsiasi operazione di pulizia o logging può essere eseguita qui
            logger.info('Finished fetching customers');
        }
    }

    async getCustomerById(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {

            const { id } = req.params;

            const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM customers WHERE id = ?', [id]);

            if (rows.length === 0) {
                /*
                logger.warn(`Customer with ID ${id} not found`);
                res.status(404).json({ 
                    success: false, 
                    message: 'Customer not found' 
                });
                return;
                */
               throw new AppError(`Customer with ID ${id} not found`, 404);
            }

            logger.info(`Customer with ID ${id} fetched successfully`);
            res.status(200).json({ 
                success: true, 
                data: rows[0] as Customer 
            });
            
        } catch (error) {
            logger.error('Error fetching customer by ID', error);
            next(error);
        } finally {
            // Qualsiasi operazione di pulizia o logging può essere eseguita qui
            logger.info('Finished fetching customer by ID');
        }
    }

    async createCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                logger.warn('Validation errors in createCustomer', { errors: errors.array() });
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }

            // Implement the logic to create a new customer here
            const customer: Customer = req.body;

            const [existing] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM customers WHERE email = ?', 
                [customer.email]
            );

            if (existing.length > 0) {
                /*
                logger.warn(`Customer with email ${customer.email} already exists`);
                res.status(409).json({ 
                    success: false, 
                    message: 'Customer with this email already exists' 
                });
                return;
                */
                throw new AppError(`Customer with email ${customer.email} already exists`, 400);
            }

            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO customers (first_name, last_name, email, phone, 
                company, address, city, state, postal_code, country, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    customer.first_name, 
                    customer.last_name, 
                    customer.email, 
                    customer.phone || null, 
                    customer.company || null, 
                    customer.address || null, 
                    customer.city || null, 
                    customer.state || null, 
                    customer.postal_code || null, 
                    customer.country || null, 
                    customer.notes || null
                ]
            );

            logger.info(`Customer created successfully with ID ${result.insertId}`);
            res.status(201).json({ 
                success: true, 
                data: { 
                    id: result.insertId, 
                    ...customer 
                } 
            });

        } catch (error) {
            logger.error('Error creating customer', error);
            next(error);
        } finally {
            logger.info('Finished creating customer');
        }
    }

    async updateCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation errors in updateCustomer', { errors: errors.array() });
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }

            const { id } = req.params;
            const customer: Partial<Customer> = req.body;

            const [existing] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM customers WHERE id = ?', 
                [id]
            );  

            if (existing.length === 0) {
                /*
                logger.warn(`Customer with ID ${id} not found for update`);
                res.status(404).json({ 
                    success: false, 
                    message: 'Customer not found' 
                });
                return;
                */
               throw new AppError(`Customer with ID ${id} not found`, 404);
            }

            if (customer.email) {
                const [emailCheck] = await pool.execute<RowDataPacket[]>(
                    'SELECT * FROM customers WHERE email = ? AND id != ?', 
                    [customer.email, id]
                );
                if (emailCheck.length > 0) {
                   throw new AppError(`Customer with email ${customer.email} already exists`, 400);
                }
            }

            const fields: string[] = [];
            const values: any[] = [];

            Object.entries(customer).forEach(([key, value]) => {
                fields.push(`${key} = ?`);
                values.push(value);
            });

            if (fields.length === 0) {
                throw new AppError('No fields provided for update', 400);
            }

            values.push(id);
            const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;

            await pool.execute(query, values);

            logger.info(`Customer with ID ${id} updated successfully`);
            res.status(200).json({ 
                success: true, 
                message: 'Customer updated successfully' 
            });

        } catch (error) {
            logger.error('Error updating customer', error);
            next(error);
        } finally {
            // Qualsiasi operazione di pulizia o logging può essere eseguita qui
            logger.info('Finished updating customer');
        }
    }

    async deleteCustomer(req: Request, res: Response, next: NextFunction) : Promise<void> {
        try {
            
            const { id } = req.params;

            const [result] = await pool.execute<ResultSetHeader>(
                'DELETE FROM customers WHERE id = ?', 
                [id]
            );

            if (result.affectedRows === 0) {
               throw new AppError(`Customer with ID ${id} not found`, 404);
            }

            logger.info(`Customer with ID ${id} deleted successfully`);
            res.status(200).json({ 
                success: true, 
                message: 'Customer deleted successfully' 
            });


        } catch (error) {
            logger.error('Error deleting customer', error);
            next(error);    
        } finally {
            logger.info('Finished deleting customer');
        }
    }

}



export default new CustomersController();