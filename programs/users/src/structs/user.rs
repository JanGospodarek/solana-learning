use anchor_lang::prelude::*;

use crate::errors::TransferError;

#[account]
pub struct UserAcc {
    pub balance: u64,
    pub bump: u8,
}
impl UserAcc {
    // TODO make this lazy calculation
    pub const ACCOUNT_SPACE: usize = 8 + 8 + 1;

    pub fn give(&mut self, ammount: u64) -> Result<()> {
        self.balance += ammount;

        Ok(())
    }
    pub fn take(&mut self, ammount: u64) -> Result<()> {
        if self.balance < ammount {
            return err!(TransferError::PayerIsBroke);
        }

        self.balance -= ammount;

        Ok(())
    }
}
