export const emitParcelUpdate = (io, trackingNumber, update) => {
  io.to(`parcel_${trackingNumber}`).emit("parcelUpdate", update);
};
