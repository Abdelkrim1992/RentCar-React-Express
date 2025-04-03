  // Helper method to fetch updated availability data
  private async fetchUpdatedAvailability(id: number): Promise<CarAvailability | undefined> {
    try {
      // Fetch the updated record
      const updated = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        console.log('Failed to retrieve updated record');
        return undefined;
      }
      
      const row = Array.isArray(updated) ? updated[0] : updated;
      console.log('Updated record:', row);
      
      return {
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        carType: row.car_type || undefined,
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching updated availability:', error);
      return undefined;
    }
  }

  async updateCarAvailability(id: number, availability: AppTypes.CarAvailabilityUpdateInput): Promise<CarAvailability | undefined> {
    try {
      console.log("Updating car availability:", { id, availability });
      
      // First check if the record exists
      const existingRecord = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!existingRecord || (Array.isArray(existingRecord) && existingRecord.length === 0)) {
        console.log(`Car availability with ID ${id} not found`);
        return undefined;
      }
      
      // Get the existing data to use for fields that aren't being updated
      const existing = Array.isArray(existingRecord) ? existingRecord[0] : existingRecord;
      
      // Get or update car type if needed
      let carType = availability.carType;
      if (!carType && availability.carId !== undefined && availability.carId !== existing.car_id) {
        try {
          const car = await prisma.car.findUnique({
            where: { id: availability.carId }
          });
          
          if (car) {
            carType = car.type;
          }
        } catch (err) {
          console.error('Error fetching car type for update:', err);
        }
      }
      
      // Try first with car_type column
      try {
        await prisma.$executeRaw`
          UPDATE car_availabilities 
          SET 
            car_id = ${availability.carId !== undefined ? availability.carId : existing.car_id},
            start_date = ${availability.startDate !== undefined ? availability.startDate : existing.start_date},
            end_date = ${availability.endDate !== undefined ? availability.endDate : existing.end_date},
            is_available = ${availability.isAvailable !== undefined ? availability.isAvailable : existing.is_available},
            car_type = ${carType !== undefined ? carType : existing.car_type}
          WHERE id = ${id}
        `;
        console.log('Updated car availability with car_type column');
      } catch (error) {
        console.log('Error updating with car_type, trying without car_type column', error);
        // If car_type column doesn't exist, try without it
        await prisma.$executeRaw`
          UPDATE car_availabilities 
          SET 
            car_id = ${availability.carId !== undefined ? availability.carId : existing.car_id},
            start_date = ${availability.startDate !== undefined ? availability.startDate : existing.start_date},
            end_date = ${availability.endDate !== undefined ? availability.endDate : existing.end_date},
            is_available = ${availability.isAvailable !== undefined ? availability.isAvailable : existing.is_available}
          WHERE id = ${id}
        `;
        console.log('Updated car availability without car_type column');
      }
      
      // Fetch the updated record
      const updated = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        console.log('Failed to retrieve updated record');
        return undefined;
      }
      
      const row = Array.isArray(updated) ? updated[0] : updated;
      console.log('Updated record:', row);
      
      return {
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        carType: row.car_type || undefined,
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      };
    } catch (error) {
      console.error('Error updating car availability:', error);
      return undefined;
    }
  }