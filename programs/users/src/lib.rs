use anchor_lang::prelude::*;
mod errors;
mod misc;
mod structs;
use misc::*;
use structs::user::UserAcc;
declare_id!("DQ9nu6GFksF3R1nR15bT46KJDzoTZsYGenm71pHF6xZJ");

#[program]
pub mod users {
    use std::borrow::BorrowMut;

    use super::*;

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user_acc;
        user.balance = 10;
        user.bump = *ctx.bumps.get(SEED_PREFIX).expect("bump not found");
        Ok(())
    }
    pub fn transfer(ctx: Context<Transfer>, ammount: u64) -> Result<()> {
        let payer = ctx.accounts.sender_acc.borrow_mut();
        payer.take(ammount)?;

        let reciever = ctx.accounts.receiver_acc.borrow_mut();
        reciever.give(ammount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = UserAcc::ACCOUNT_SPACE,
        seeds = [SEED_PREFIX.as_bytes().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user_acc: Account<'info, UserAcc>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    // #[account(mut)]
    // pub receiver: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [SEED_PREFIX.as_bytes().as_ref(), sender.key().as_ref()],
        bump = sender_acc.bump
    )]
    pub sender_acc: Account<'info, UserAcc>,
    #[account(
        mut,
        // seeds = [SEED_PREFIX.as_bytes().as_ref(), receiver.key().as_ref()],
        // bump = receiver_acc.bump
    )]
    pub receiver_acc: Account<'info, UserAcc>,
}
