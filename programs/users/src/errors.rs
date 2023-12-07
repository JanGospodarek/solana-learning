use anchor_lang::prelude::*;

#[error_code]
pub enum TransferError {
    #[msg("payer can not pay the required ammount, cause he broke lol")]
    PayerIsBroke,
}
