use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Token,InitializeMint,MintTo,Transfer};
declare_id!("DQ9nu6GFksF3R1nR15bT46KJDzoTZsYGenm71pHF6xZJ");

#[program]
pub mod users {
    use super::*;

    pub fn mint_token(ctx:Context<MintToken>)->Result<()>{
        let cpi_accounts=MintTo{
            mint:ctx.accounts.mint.to_account_info(),
            to:ctx.accounts.token_account.to_account_info(),
            authority:ctx.accounts.payer.to_account_info()
        };
        let cpi_program=ctx.accounts.token_program.to_account_info();
        let cpi_ctx=CpiContext::new(cpi_program,cpi_accounts);

        token::mint_to(cpi_ctx,10)?;
        Ok(())
    }

    pub fn transfer_token(ctx:Context<TransferToken>)->Result<()>{
        let cpi_accounts=Transfer{
            from:ctx.accounts.from.to_account_info(),
            to:ctx.accounts.to.to_account_info(),
            authority:ctx.accounts.signer.to_account_info()
        };
        let cpi_program=ctx.accounts.token_program.to_account_info();
        let cpi_ctx=CpiContext::new(cpi_program,cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx,5)?;
        Ok(())
    }
    
}

#[derive(Accounts)]
pub struct MintToken<'info>{
    /// CHECK: this is apparently not dangerous
    #[account(mut)]
    pub mint:UncheckedAccount<'info>,
    pub token_program:Program<'info,Token>,
    /// CHECK: this is apparently not dangerous
    #[account(mut)]
    pub token_account:UncheckedAccount<'info>,
    /// CHECK: this is apparently not dangerous
    #[account(mut)]
    pub payer:AccountInfo<'info>,
    
}

#[derive(Accounts)]
pub struct TransferToken<'info>{
    pub token_program:Program<'info,Token>,
    /// CHECK: this is apparently not dangerous
    #[account(mut)]
    pub from:UncheckedAccount<'info>,
    /// CHECK: this is apparently not dangerous
    #[account(mut)]
    pub to:AccountInfo<'info>,
    #[account(mut)]
    pub signer:Signer<'info>,

}