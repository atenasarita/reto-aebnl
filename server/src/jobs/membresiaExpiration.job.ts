import { OracleBeneficiarioRepository } from '../repositories/beneficiario.repository';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const beneficiarioRepository = new OracleBeneficiarioRepository();

const refreshExpiredMemberships = async () => {
  // await beneficiarioRepository.refreshExpiredMembresias();
  try {
    await beneficiarioRepository.refreshExpiredMembresias();
    // console.log('Expired memberships refreshed successfully');
  } catch (error) {
    // console.error('Failed to refresh expired memberships:', error);
    console.error('Failed to refresh expired memberships:');
  }
};

export function startMembresiaExpirationJob(): void {
  refreshExpiredMemberships();
  setInterval(refreshExpiredMemberships, ONE_DAY_MS);
}
