// lib/gridfs.ts
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gfs: GridFSBucket;

const connectGridFS = async () => {
  const conn = await mongoose.connection;
  if (!conn.db) {
    throw new Error('Database not connected');
  }
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
};

export { gfs, connectGridFS };
