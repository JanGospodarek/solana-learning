use anchor_lang::prelude::*;
mod errors;
mod misc;
mod structs;
use misc::*;
use structs::user::UserAcc;
use anchor_spl::token;
use anchor_spl::token::{Token,MintTo,Transfer,Mint};
declare_id!("DQ9nu6GFksF3R1nR15bT46KJDzoTZsYGenm71pHF6xZJ");

#[program]
pub mod users {
    use std::borrow::BorrowMut;
   
    use super::*;
     pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        Ok(())
    }
    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        // Create the MintTo struct for our context
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to mint tokens
        token::mint_to(cpi_ctx, amount)?;
        Ok(())
  
}
    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user_acc;
        user.balance = 10;
        user.bump = *ctx.bumps.get(SEED_PREFIX).expect("bump not found");
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
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    ///CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
   /// CHECK: This is the token that we want to mint
   #[account(mut)]
   pub mint: Account<'info, Mint>,
   pub token_program: Program<'info, Token>,
   /// CHECK: This is the token account that we want to mint tokens to
   #[account(mut)]
   pub token_account: AccountInfo<'info>,
   /// CHECK: the authority of the mint account
   pub authority: Signer<'info>,  
}
    
// #[derive(Accounts)]
// pub struct Transfer<'info> {
//     #[account(mut)]
//     pub sender: Signer<'info>,
//     // #[account(mut)]
//     // pub receiver: AccountInfo<'info>,
//     #[account(
//         mut,
//         seeds = [SEED_PREFIX.as_bytes().as_ref(), sender.key().as_ref()],
//         bump = sender_acc.bump
//     )]
//     pub sender_acc: Account<'info, UserAcc>,
//     #[account(
//         mut,
//         // seeds = [SEED_PREFIX.as_bytes().as_ref(), receiver.key().as_ref()],
//         // bump = receiver_acc.bump
//     )]
//     pub receiver_acc: Account<'info, UserAcc>,
// }
